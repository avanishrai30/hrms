import { describe, expect, it } from "vitest";
import { LocalStorageProvider } from "./storage.provider.js";

describe("LocalStorageProvider", () => {
  const provider = new LocalStorageProvider();

  it("uploads, retrieves stream, and deletes files correctly", async () => {
    const key = `test-tenant/payslips/2026/08/emp-123/v1.pdf`;
    const testContent = Buffer.from("%PDF-1.4 TEST BUFFER", "utf8");

    const uploadRes = await provider.upload(key, testContent);
    expect(uploadRes.path).toBe(key);
    expect(uploadRes.size).toBe(testContent.length);

    const stream = await provider.getStream(key);
    expect(stream.toString("utf8")).toBe("%PDF-1.4 TEST BUFFER");

    const url = await provider.getDownloadUrl(key);
    expect(url).toContain(encodeURIComponent(key));

    const deleted = await provider.delete(key);
    expect(deleted).toBe(true);
  });
});
