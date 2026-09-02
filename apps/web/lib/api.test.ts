import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiClientError, apiRequest } from "./api";
import { getAccessToken, setAccessToken } from "./auth-token";

describe("web API client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    setAccessToken(null);
  });

  it("preserves API status on client errors", () => {
    const error = new ApiClientError("Forbidden", 403);

    expect(error.message).toBe("Forbidden");
    expect(error.status).toBe(403);
  });

  it("sends the bearer token to protected API calls", async () => {
    setAccessToken("access-token");
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await apiRequest("/employees");

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/employees"),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer access-token" })
      })
    );
  });

  it("refreshes once on protected 401 responses", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("Unauthorized", { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ accessToken: "fresh-token" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiRequest("/analytics/ai")).resolves.toEqual({ ok: true });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock).toHaveBeenLastCalledWith(
      expect.stringContaining("/analytics/ai"),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer fresh-token" })
      })
    );
  });

  it("clears the access token when refresh fails", async () => {
    setAccessToken("expired-token");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("Unauthorized", { status: 401 }))
      .mockResolvedValueOnce(new Response("Unauthorized", { status: 401 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiRequest("/employees")).rejects.toMatchObject({
      message: "Your session has expired. Sign in again to continue.",
      status: 401
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(getAccessToken()).toBeNull();
  });

  it("does not refresh on permission failures", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: "Missing permission" }), { status: 403 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiRequest("/settings/tenant")).rejects.toMatchObject({
      message: "You do not have access to this area.",
      status: 403
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
