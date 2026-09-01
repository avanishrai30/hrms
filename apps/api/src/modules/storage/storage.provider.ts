import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { Injectable, NotFoundException } from "@nestjs/common";

export interface UploadResult {
  path: string;
  size: number;
  contentType?: string;
  etag?: string;
  url?: string;
}

export interface StorageProvider {
  upload(key: string, buffer: Buffer, contentType?: string): Promise<UploadResult>;
  getStream(key: string): Promise<Buffer>;
  getDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;
  delete(key: string): Promise<boolean>;
}

export const STORAGE_PROVIDER = "STORAGE_PROVIDER";

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly baseDir: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir ?? join(process.cwd(), ".storage");
    if (!existsSync(this.baseDir)) {
      mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async upload(key: string, buffer: Buffer, contentType?: string): Promise<UploadResult> {
    const filePath = join(this.baseDir, key);
    const dir = dirname(filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(filePath, buffer);
    return {
      path: key,
      size: buffer.length,
      contentType: contentType ?? "application/octet-stream"
    };
  }

  async getStream(key: string): Promise<Buffer> {
    const filePath = join(this.baseDir, key);
    if (!existsSync(filePath)) {
      throw new NotFoundException(`File not found: ${key}`);
    }
    return readFileSync(filePath);
  }

  async getDownloadUrl(key: string, _expiresInSeconds = 3600): Promise<string> {
    // Return relative download path to be handled by the platform controller
    return `/api/v1/storage/download?key=${encodeURIComponent(key)}`;
  }

  async delete(key: string): Promise<boolean> {
    const filePath = join(this.baseDir, key);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
      return true;
    }
    return false;
  }
}
