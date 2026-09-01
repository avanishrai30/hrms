import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import type { AuthenticatedRequest } from "../common/request-context.js";
import { StructuredLoggerService } from "./logger.service.js";
import { MetricsService } from "./metrics.service.js";

@Injectable()
export class RequestLoggerInterceptor implements NestInterceptor {
  private readonly logger = new StructuredLoggerService("HTTP");

  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<AuthenticatedRequest & { method: string; originalUrl?: string; url: string; headers: Record<string, string | string[] | undefined>; ip?: string }>();
    const res = http.getResponse<{ statusCode: number; setHeader?: (name: string, value: string) => void }>();

    const startTime = Date.now();
    const method = req.method;
    const path = req.originalUrl || req.url;
    const ip = req.ip || (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || "unknown";
    const userAgent = (req.headers["user-agent"] as string) || "unknown";

    // Extract or generate requestId
    const headerRequestId = req.headers["x-request-id"];
    const requestId = (typeof headerRequestId === "string" ? headerRequestId : Array.isArray(headerRequestId) ? headerRequestId[0] : undefined) || randomUUID();

    if (res.setHeader) {
      res.setHeader("X-Request-Id", requestId);
    }

    // Extract tenantId from request user if present
    const tenantId = req.user?.tenantId;

    return next.handle().pipe(
      tap({
        next: () => {
          const durationMs = Date.now() - startTime;
          const statusCode = res.statusCode || 200;

          this.metricsService.recordRequest(method, path, statusCode, durationMs, tenantId);

          this.logger.info(`${method} ${path} ${statusCode} ${durationMs}ms`, "HTTP", {
            method,
            path,
            statusCode,
            durationMs,
            tenantId,
            requestId,
            ip,
            userAgent
          });
        },
        error: (err: unknown) => {
          const durationMs = Date.now() - startTime;
          const status = (err as { status?: number; getStatus?: () => number })?.getStatus?.() ||
                         (err as { status?: number })?.status ||
                         500;

          this.metricsService.recordRequest(method, path, status, durationMs, tenantId);
          this.metricsService.incrementErrorRate((err as Error)?.name || "HttpException", tenantId);

          this.logger.error(
            `${method} ${path} ${status} ${durationMs}ms - ${(err as Error)?.message}`,
            (err as Error)?.stack,
            "HTTP",
            {
              method,
              path,
              statusCode: status,
              durationMs,
              tenantId,
              requestId,
              ip,
              userAgent
            }
          );
        }
      })
    );
  }
}
