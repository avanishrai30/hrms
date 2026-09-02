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

function normalizeApiError(status: number, body: string) {
  if (status === 401) return "Your session has expired. Sign in again to continue.";
  if (status === 403) return "You do not have access to this area.";
  if (status >= 500) return "We could not reach AIavro right now. Try again.";
  try {
    const parsed = JSON.parse(body) as { message?: unknown };
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
