import { createHash, createHmac } from "node:crypto";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import type { StorageProvider, UploadResult } from "../storage.provider.js";

export interface S3StorageConfig {
  endpoint?: string;
  bucket?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  region?: string;
  forcePathStyle?: boolean;
}

@Injectable()
export class S3StorageProvider implements StorageProvider {
  private readonly logger = new Logger(S3StorageProvider.name);
  private readonly endpoint: string;
  private readonly bucket: string;
  private readonly accessKeyId: string;
  private readonly secretAccessKey: string;
  private readonly region: string;
  private readonly forcePathStyle: boolean;

  constructor(config?: S3StorageConfig) {
    this.endpoint =
      config?.endpoint ??
      process.env.S3_ENDPOINT ??
      "https://s3.amazonaws.com";
    this.bucket = config?.bucket ?? process.env.S3_BUCKET ?? "vc-wms-storage";
    this.accessKeyId =
      config?.accessKeyId ??
      process.env.S3_ACCESS_KEY ??
      process.env.AWS_ACCESS_KEY_ID ??
      "minioadmin";
    this.secretAccessKey =
      config?.secretAccessKey ??
      process.env.S3_SECRET_KEY ??
      process.env.AWS_SECRET_ACCESS_KEY ??
      "minioadmin";
    this.region =
      config?.region ??
      process.env.S3_REGION ??
      process.env.AWS_REGION ??
      "us-east-1";

    if (config?.forcePathStyle !== undefined) {
      this.forcePathStyle = config.forcePathStyle;
    } else {
      // Force path style for localhost, IP addresses, MinIO or custom ports
      this.forcePathStyle =
        this.endpoint.includes("localhost") ||
        this.endpoint.includes("127.0.0.1") ||
        this.endpoint.includes("minio") ||
        !this.endpoint.includes("amazonaws.com");
    }
  }

  getBucketName(): string {
    return this.bucket;
  }

  getRegion(): string {
    return this.region;
  }

  getEndpoint(): string {
    return this.endpoint;
  }

  private cleanKey(key: string): string {
    return key.replace(/^\/+/, "");
  }

  private encodeUriPath(path: string): string {
    return path
      .split("/")
      .map((segment) => encodeURIComponent(segment).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`))
      .join("/");
  }

  private getUrlAndHost(key: string): { url: URL; hostHeader: string; canonicalUri: string } {
    const cleanKey = this.cleanKey(key);
    let urlString: string;
    let canonicalUri: string;

    const base = this.endpoint.replace(/\/+$/, "");

    if (this.forcePathStyle) {
      urlString = `${base}/${this.bucket}/${this.encodeUriPath(cleanKey)}`;
      const parsed = new URL(urlString);
      canonicalUri = `/${this.bucket}/${this.encodeUriPath(cleanKey)}`;
      return { url: parsed, hostHeader: parsed.host, canonicalUri };
    }

    // Virtual-hosted style: https://bucket.s3.region.amazonaws.com/key
    const parsedBase = new URL(base);
    const hostWithBucket = `${this.bucket}.${parsedBase.host}`;
    urlString = `${parsedBase.protocol}//${hostWithBucket}/${this.encodeUriPath(cleanKey)}`;
    const parsed = new URL(urlString);
    canonicalUri = `/${this.encodeUriPath(cleanKey)}`;
    return { url: parsed, hostHeader: hostWithBucket, canonicalUri };
  }

  private sha256Hex(data: Buffer | string): string {
    return createHash("sha256").update(data).digest("hex");
  }

  private hmacSha256(key: Buffer | string, data: string): Buffer {
    return createHmac("sha256", key).update(data).digest();
  }

  private getSigningKey(dateStamp: string): Buffer {
    const kDate = this.hmacSha256(`AWS4${this.secretAccessKey}`, dateStamp);
    const kRegion = this.hmacSha256(kDate, this.region);
    const kService = this.hmacSha256(kRegion, "s3");
    return this.hmacSha256(kService, "aws4_request");
  }

  private createAuthorizationHeader(
    method: string,
    canonicalUri: string,
    hostHeader: string,
    payloadHash: string,
    amzDate: string,
    dateStamp: string,
    additionalHeaders: Record<string, string> = {}
  ): string {
    const headersToSign: Record<string, string> = {
      host: hostHeader,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
      ...additionalHeaders
    };

    const sortedHeaderKeys = Object.keys(headersToSign).sort();
    const canonicalHeaders = sortedHeaderKeys
      .map((k) => `${k.toLowerCase()}:${headersToSign[k]?.trim() ?? ""}\n`)
      .join("");
    const signedHeaders = sortedHeaderKeys.map((k) => k.toLowerCase()).join(";");

    const canonicalRequest = [
      method,
      canonicalUri,
      "", // Query string
      canonicalHeaders,
      signedHeaders,
      payloadHash
    ].join("\n");

    const credentialScope = `${dateStamp}/${this.region}/s3/aws4_request`;
    const stringToSign = [
      "AWS4-HMAC-SHA256",
      amzDate,
      credentialScope,
      this.sha256Hex(canonicalRequest)
    ].join("\n");

    const signingKey = this.getSigningKey(dateStamp);
    const signature = this.hmacSha256(signingKey, stringToSign).toString("hex");

    return `AWS4-HMAC-SHA256 Credential=${this.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  }

  async upload(key: string, buffer: Buffer, contentType = "application/octet-stream"): Promise<UploadResult> {
    const { url, hostHeader, canonicalUri } = this.getUrlAndHost(key);
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
    const dateStamp = amzDate.substring(0, 8);
    const payloadHash = this.sha256Hex(buffer);

    const headers: Record<string, string> = {
      host: hostHeader,
      "content-type": contentType,
      "content-length": String(buffer.length),
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate
    };

    const authHeader = this.createAuthorizationHeader(
      "PUT",
      canonicalUri,
      hostHeader,
      payloadHash,
      amzDate,
      dateStamp,
      { "content-type": contentType }
    );

    headers["Authorization"] = authHeader;

    try {
      const res = await fetch(url.toString(), {
        method: "PUT",
        headers,
        body: new Uint8Array(buffer)
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`S3 upload failed [${res.status}]: ${errText}`);
      }

      const etag = res.headers.get("etag")?.replace(/"/g, "") ?? undefined;

      return {
        path: key,
        size: buffer.length,
        contentType,
        etag,
        url: url.toString()
      };
    } catch (err: unknown) {
      this.logger.error(`S3 upload error for key ${key}: ${err instanceof Error ? err.message : "Unknown error"}`);
      throw err;
    }
  }

  async getStream(key: string): Promise<Buffer> {
    const { url, hostHeader, canonicalUri } = this.getUrlAndHost(key);
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
    const dateStamp = amzDate.substring(0, 8);
    const payloadHash = this.sha256Hex("");

    const authHeader = this.createAuthorizationHeader(
      "GET",
      canonicalUri,
      hostHeader,
      payloadHash,
      amzDate,
      dateStamp
    );

    const headers: Record<string, string> = {
      host: hostHeader,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
      Authorization: authHeader
    };

    const res = await fetch(url.toString(), {
      method: "GET",
      headers
    });

    if (res.status === 404) {
      throw new NotFoundException(`File not found in S3: ${key}`);
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`S3 getStream failed [${res.status}]: ${errText}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  async getDownloadUrl(key: string, expiresInSeconds = 900): Promise<string> {
    const { url, hostHeader, canonicalUri } = this.getUrlAndHost(key);
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
    const dateStamp = amzDate.substring(0, 8);

    const credentialScope = `${dateStamp}/${this.region}/s3/aws4_request`;

    const queryParams: Record<string, string> = {
      "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
      "X-Amz-Credential": `${this.accessKeyId}/${credentialScope}`,
      "X-Amz-Date": amzDate,
      "X-Amz-Expires": String(expiresInSeconds),
      "X-Amz-SignedHeaders": "host"
    };

    const sortedParamKeys = Object.keys(queryParams).sort();
    const canonicalQueryString = sortedParamKeys
      .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(queryParams[k] ?? "")}`)
      .join("&");

    const canonicalHeaders = `host:${hostHeader}\n`;
    const signedHeaders = "host";

    const canonicalRequest = [
      "GET",
      canonicalUri,
      canonicalQueryString,
      canonicalHeaders,
      signedHeaders,
      "UNSIGNED-PAYLOAD"
    ].join("\n");

    const stringToSign = [
      "AWS4-HMAC-SHA256",
      amzDate,
      credentialScope,
      this.sha256Hex(canonicalRequest)
    ].join("\n");

    const signingKey = this.getSigningKey(dateStamp);
    const signature = this.hmacSha256(signingKey, stringToSign).toString("hex");

    return `${url.origin}${url.pathname}?${canonicalQueryString}&X-Amz-Signature=${signature}`;
  }

  async delete(key: string): Promise<boolean> {
    const { url, hostHeader, canonicalUri } = this.getUrlAndHost(key);
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
    const dateStamp = amzDate.substring(0, 8);
    const payloadHash = this.sha256Hex("");

    const authHeader = this.createAuthorizationHeader(
      "DELETE",
      canonicalUri,
      hostHeader,
      payloadHash,
      amzDate,
      dateStamp
    );

    const headers: Record<string, string> = {
      host: hostHeader,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
      Authorization: authHeader
    };

    try {
      const res = await fetch(url.toString(), {
        method: "DELETE",
        headers
      });

      // 204 No Content or 200 OK or 404 (already deleted) are considered successful deletes in S3
      return res.status === 204 || res.status === 200 || res.status === 404;
    } catch (err: unknown) {
      this.logger.error(`S3 delete error for key ${key}: ${err instanceof Error ? err.message : "Unknown error"}`);
      return false;
    }
  }
}
