import { NotFoundException } from "@nestjs/common";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { S3StorageProvider } from "../src/modules/storage/providers/s3.provider.js";
import {
  LocalStorageProvider,
  STORAGE_PROVIDER
} from "../src/modules/storage/storage.provider.js";

describe("Storage Providers", () => {
  describe("LocalStorageProvider", () => {
    let provider: LocalStorageProvider;

    beforeEach(() => {
      provider = new LocalStorageProvider();
    });

    it("uploads, retrieves stream, and deletes files correctly", async () => {
      const key = `test-tenant/payslips/2026/08/emp-123/v1.pdf`;
      const testContent = Buffer.from("%PDF-1.4 TEST BUFFER CONTENT", "utf8");

      const uploadRes = await provider.upload(key, testContent, "application/pdf");
      expect(uploadRes.path).toBe(key);
      expect(uploadRes.size).toBe(testContent.length);
      expect(uploadRes.contentType).toBe("application/pdf");

      const stream = await provider.getStream(key);
      expect(stream.toString("utf8")).toBe("%PDF-1.4 TEST BUFFER CONTENT");

      const url = await provider.getDownloadUrl(key);
      expect(url).toContain(encodeURIComponent(key));

      const deleted = await provider.delete(key);
      expect(deleted).toBe(true);

      const deleteAgain = await provider.delete(key);
      expect(deleteAgain).toBe(false);
    });

    it("throws NotFoundException when retrieving a non-existent file", async () => {
      const nonExistentKey = "random-tenant/non-existent-file.pdf";
      await expect(provider.getStream(nonExistentKey)).rejects.toThrow(NotFoundException);
    });
  });

  describe("S3StorageProvider", () => {
    let s3Provider: S3StorageProvider;
    const originalFetch = global.fetch;

    beforeEach(() => {
      s3Provider = new S3StorageProvider({
        endpoint: "https://s3.us-east-1.amazonaws.com",
        bucket: "test-hrms-bucket",
        accessKeyId: "TEST_ACCESS_KEY",
        secretAccessKey: "TEST_SECRET_KEY",
        region: "us-east-1",
        forcePathStyle: true
      });
    });

    afterEach(() => {
      global.fetch = originalFetch;
    });

    it("initializes with configuration properties correctly", () => {
      expect(s3Provider.getBucketName()).toBe("test-hrms-bucket");
      expect(s3Provider.getRegion()).toBe("us-east-1");
      expect(s3Provider.getEndpoint()).toBe("https://s3.us-east-1.amazonaws.com");
    });

    it("generates a signed presigned download URL with AWS SigV4 query params", async () => {
      const key = "tenant-100/payslips/2026/08/slip.pdf";
      const presignedUrl = await s3Provider.getDownloadUrl(key, 1800);

      expect(presignedUrl).toBeDefined();
      expect(presignedUrl).toContain("test-hrms-bucket");
      expect(presignedUrl).toContain("X-Amz-Algorithm=AWS4-HMAC-SHA256");
      expect(presignedUrl).toContain("X-Amz-Credential=TEST_ACCESS_KEY");
      expect(presignedUrl).toContain("X-Amz-Date=");
      expect(presignedUrl).toContain("X-Amz-Expires=1800");
      expect(presignedUrl).toContain("X-Amz-SignedHeaders=host");
      expect(presignedUrl).toContain("X-Amz-Signature=");
    });

    it("uploads buffer to S3 with SigV4 Authorization header", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ etag: '"abcd1234etag"' }),
        text: vi.fn().mockResolvedValue("")
      });
      global.fetch = mockFetch as unknown as typeof fetch;

      const key = "tenant-100/documents/contract.pdf";
      const content = Buffer.from("DUMMY CONTRACT DATA", "utf8");

      const result = await s3Provider.upload(key, content, "application/pdf");

      expect(result.path).toBe(key);
      expect(result.size).toBe(content.length);
      expect(result.etag).toBe("abcd1234etag");
      expect(mockFetch).toHaveBeenCalledTimes(1);

      const [calledUrl, calledOptions] = (mockFetch.mock.calls[0] ?? []) as [string, RequestInit];
      expect(calledUrl).toContain("test-hrms-bucket");
      expect(calledOptions.method).toBe("PUT");
      const headers = (calledOptions.headers ?? {}) as Record<string, string>;
      expect(headers.Authorization).toContain("AWS4-HMAC-SHA256");
      expect(headers.Authorization).toContain("Credential=TEST_ACCESS_KEY");
      expect(headers["x-amz-content-sha256"]).toBeDefined();
    });

    it("retrieves file stream from S3 and handles 404 as NotFoundException", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        arrayBuffer: vi.fn().mockResolvedValue(new TextEncoder().encode("DOWNLOADED PAYSLIP").buffer)
      });
      global.fetch = mockFetch as unknown as typeof fetch;

      const key = "tenant-100/payslips/slip.pdf";
      const buffer = await s3Provider.getStream(key);
      expect(buffer.toString("utf8")).toBe("DOWNLOADED PAYSLIP");

      // Test 404
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: vi.fn().mockResolvedValue("NoSuchKey")
      }) as unknown as typeof fetch;

      await expect(s3Provider.getStream("missing-key.pdf")).rejects.toThrow(NotFoundException);
    });

    it("deletes file from S3", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204
      });
      global.fetch = mockFetch as unknown as typeof fetch;

      const key = "tenant-100/temp/old.pdf";
      const deleted = await s3Provider.delete(key);
      expect(deleted).toBe(true);

      const [calledUrl, calledOptions] = (mockFetch.mock.calls[0] ?? []) as [string, RequestInit];
      expect(calledUrl).toContain("test-hrms-bucket");
      expect(calledOptions.method).toBe("DELETE");
      const deleteHeaders = (calledOptions.headers ?? {}) as Record<string, string>;
      expect(deleteHeaders.Authorization).toContain("AWS4-HMAC-SHA256");
    });
  });

  describe("Storage Provider Injection & Factory", () => {
    it("exports STORAGE_PROVIDER token", () => {
      expect(STORAGE_PROVIDER).toBe("STORAGE_PROVIDER");
    });
  });
});
