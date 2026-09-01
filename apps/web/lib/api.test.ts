import { describe, expect, it } from "vitest";
import { ApiClientError } from "./api";

describe("web API client", () => {
  it("preserves API status on client errors", () => {
    const error = new ApiClientError("Forbidden", 403);

    expect(error.message).toBe("Forbidden");
    expect(error.status).toBe(403);
  });
});

