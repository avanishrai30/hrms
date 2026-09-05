import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  NotFoundException,
  Query,
  Req,
  Res
} from "@nestjs/common";
import type { Response } from "express";
import { type AuthenticatedRequest } from "../common/request-context.js";
import { requireTenantContext } from "../common/tenant-context.js";
import { RequirePermissions } from "../rbac/permissions.decorator.js";
import { STORAGE_PROVIDER, type StorageProvider } from "./storage.provider.js";

@Controller("storage")
export class StorageController {
  constructor(
    @Inject(STORAGE_PROVIDER) private readonly storageProvider: StorageProvider
  ) {}

  @Get("download")
  @RequirePermissions("documents.view")
  async downloadFile(
    @Query("key") key: string,
    @Req() request: AuthenticatedRequest,
    @Res() res: Response
  ) {
    if (!key || typeof key !== "string" || key.trim() === "") {
      throw new BadRequestException("Storage key is required.");
    }

    const tenant = requireTenantContext(request);
    const sanitizedKey = key.replace(/\\/g, "/");

    // Strict tenant boundary check: key MUST start with `tenants/{tenantId}/`
    const expectedPrefix = `tenants/${tenant.tenantId}/`;
    if (!sanitizedKey.startsWith(expectedPrefix)) {
      throw new ForbiddenException("Unauthorized access to storage asset outside your tenant workspace.");
    }

    // Prevent path traversal
    if (sanitizedKey.includes("..")) {
      throw new BadRequestException("Invalid storage key path.");
    }

    try {
      const buffer = await this.storageProvider.getStream(sanitizedKey);
      const filename = sanitizedKey.split("/").pop() || "download";

      // Infer MIME type based on extension
      let contentType = "application/octet-stream";
      if (filename.endsWith(".pdf")) contentType = "application/pdf";
      else if (filename.endsWith(".png")) contentType = "image/png";
      else if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) contentType = "image/jpeg";
      else if (filename.endsWith(".docx")) contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      else if (filename.endsWith(".doc")) contentType = "application/msword";
      else if (filename.endsWith(".txt")) contentType = "text/plain";
      else if (filename.endsWith(".md")) contentType = "text/markdown";

      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(filename)}"`);
      res.setHeader("Content-Length", buffer.length);
      res.send(buffer);
    } catch {
      throw new NotFoundException("The requested storage asset was not found.");
    }
  }
}
