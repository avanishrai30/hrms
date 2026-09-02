import { getAccessToken, setAccessToken } from "./auth-token";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
  }
}

function validationIssueMessage(parsed: unknown) {
  if (!parsed || typeof parsed !== "object") return null;
  const record = parsed as Record<string, unknown>;
  if (record.code !== "VALIDATION_FAILED") return null;
  const issues = record.issues;
  if (!issues || typeof issues !== "object") return "Some sign-in details are invalid.";
  const fieldErrors = (issues as Record<string, unknown>).fieldErrors;
  if (!fieldErrors || typeof fieldErrors !== "object") return "Some sign-in details are invalid.";
  const messages = Object.entries(fieldErrors as Record<string, unknown>)
    .flatMap(([field, value]) =>
      Array.isArray(value)
        ? value.filter((item): item is string => typeof item === "string").map((item) => `${field}: ${item}`)
        : []
    );
  return messages.length ? messages.join(" ") : "Some sign-in details are invalid.";
}

function normalizeApiError(status: number, body: string) {
  if (status === 401) return "Your session has expired. Sign in again to continue.";
  if (status === 403) return "You do not have access to this area.";
  if (status >= 500) return "We could not reach AIavro right now. Try again.";
  try {
    const parsed = JSON.parse(body) as { message?: unknown };
    const validationMessage = validationIssueMessage(parsed);
    if (validationMessage) return validationMessage;
    if (typeof parsed.message === "string") return parsed.message;
    if (Array.isArray(parsed.message)) return parsed.message.join(" ");
  } catch {
    if (body.trim()) return body;
  }
  return "Something went wrong.";
}

async function refreshAccessToken() {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    cache: "no-store"
  });
  if (!response.ok) return null;
  const body = (await response.json()) as { accessToken?: string };
  if (!body.accessToken) return null;
  setAccessToken(body.accessToken);
  return body.accessToken;
}

function notifySessionExpired(path: string) {
  if (path.startsWith("/auth/")) return;
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("aiavro:session-expired"));
}

async function requestWithToken(path: string, init: RequestInit, token: string | null) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {})
    },
    credentials: "include",
    cache: "no-store"
  });
  return response;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response = await requestWithToken(path, init, getAccessToken());
  if (response.status === 401 && !path.startsWith("/auth/")) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      response = await requestWithToken(path, init, refreshed);
    }
  }
  if (!response.ok) {
    const body = await response.text();
    if (response.status === 401) {
      setAccessToken(null);
      notifySessionExpired(path);
    }
    throw new ApiClientError(normalizeApiError(response.status, body), response.status);
  }
  return response.json() as Promise<T>;
}

export function getApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export async function downloadAuthenticatedFile(path: string, defaultFilename: string = "download.pdf"): Promise<void> {
  const token = getAccessToken();
  let response = await fetch(getApiUrl(path), {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    credentials: "include"
  });

  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      response = await fetch(getApiUrl(path), {
        headers: {
          Authorization: `Bearer ${refreshed}`
        },
        credentials: "include"
      });
    }
  }

  if (!response.ok) {
    throw new ApiClientError("Failed to download file.", response.status);
  }

  const contentDisposition = response.headers.get("Content-Disposition");
  let filename = defaultFilename;
  if (contentDisposition) {
    const match = contentDisposition.match(/filename=["']?([^"';]+)["']?/);
    if (match && match[1]) {
      filename = match[1];
    }
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
