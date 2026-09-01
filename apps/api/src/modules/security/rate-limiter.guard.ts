import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  SetMetadata
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { AuthenticatedRequest } from "../common/request-context.js";

export const SKIP_RATE_LIMIT_KEY = Symbol("SKIP_RATE_LIMIT");
export const SkipRateLimit = () => SetMetadata(SKIP_RATE_LIMIT_KEY, true);

export interface RateLimitConfig {
  tenantWindowMs: number;
  tenantMaxRequests: number;
  ipWindowMs: number;
  ipMaxRequests: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  tenantWindowMs: 60 * 1000, // 1 minute
  tenantMaxRequests: 120,    // 120 req/min per tenant
  ipWindowMs: 60 * 1000,     // 1 minute
  ipMaxRequests: 60          // 60 req/min per IP
};

@Injectable()
export class RateLimiterGuard implements CanActivate {
  private readonly tenantWindows = new Map<string, number[]>();
  private readonly ipWindows = new Map<string, number[]>();
  private readonly config: RateLimitConfig;

  constructor(
    private readonly reflector?: Reflector,
    customConfig?: Partial<RateLimitConfig>
  ) {
    this.config = { ...DEFAULT_CONFIG, ...customConfig };
  }

  private cleanOldHits(hits: number[], windowMs: number, now: number): number[] {
    const threshold = now - windowMs;
    // hits are ordered chronologically
    const validIndex = hits.findIndex((t) => t > threshold);
    if (validIndex === -1) return [];
    return hits.slice(validIndex);
  }

  private checkLimit(
    store: Map<string, number[]>,
    key: string,
    maxRequests: number,
    windowMs: number,
    now: number
  ): { allowed: boolean; remaining: number; resetMs: number } {
    let hits = store.get(key) ?? [];
    hits = this.cleanOldHits(hits, windowMs, now);

    if (hits.length >= maxRequests) {
      const oldestHit = hits[0] ?? now;
      const resetMs = Math.max(0, oldestHit + windowMs - now);
      store.set(key, hits);
      return { allowed: false, remaining: 0, resetMs };
    }

    hits.push(now);
    store.set(key, hits);
    const resetMs = Math.max(0, (hits[0] ?? now) + windowMs - now);
    return {
      allowed: true,
      remaining: maxRequests - hits.length,
      resetMs
    };
  }

  canActivate(context: ExecutionContext): boolean {
    if (this.reflector) {
      const skip = this.reflector.getAllAndOverride<boolean>(SKIP_RATE_LIMIT_KEY, [
        context.getHandler(),
        context.getClass()
      ]);
      if (skip) return true;
    }

    const http = context.switchToHttp();
    const req = http.getRequest<AuthenticatedRequest & { ip?: string; headers: Record<string, string | string[] | undefined> }>();
    const res = http.getResponse<{ setHeader?: (name: string, value: string | number) => void }>();

    const now = Date.now();

    // 1. IP-based Rate Limiting
    const rawIp = req.ip || (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || "127.0.0.1";
    const ipKey = `ip_${rawIp}`;
    const ipResult = this.checkLimit(
      this.ipWindows,
      ipKey,
      this.config.ipMaxRequests,
      this.config.ipWindowMs,
      now
    );

    if (res.setHeader) {
      res.setHeader("X-RateLimit-Limit-IP", this.config.ipMaxRequests);
      res.setHeader("X-RateLimit-Remaining-IP", ipResult.remaining);
    }

    if (!ipResult.allowed) {
      if (res.setHeader) {
        res.setHeader("Retry-After", Math.ceil(ipResult.resetMs / 1000));
      }
      throw new HttpException(
        {
          code: "IP_RATE_LIMIT_EXCEEDED",
          message: "Too many requests from this IP address. Please try again later.",
          retryAfterSeconds: Math.ceil(ipResult.resetMs / 1000)
        },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    // 2. Tenant-based Rate Limiting (if tenant context is present)
    const tenantId = req.user?.tenantId;
    if (tenantId) {
      const tenantKey = `tenant_${tenantId}`;
      const tenantResult = this.checkLimit(
        this.tenantWindows,
        tenantKey,
        this.config.tenantMaxRequests,
        this.config.tenantWindowMs,
        now
      );

      if (res.setHeader) {
        res.setHeader("X-RateLimit-Limit-Tenant", this.config.tenantMaxRequests);
        res.setHeader("X-RateLimit-Remaining-Tenant", tenantResult.remaining);
      }

      if (!tenantResult.allowed) {
        if (res.setHeader) {
          res.setHeader("Retry-After", Math.ceil(tenantResult.resetMs / 1000));
        }
        throw new HttpException(
          {
            code: "TENANT_RATE_LIMIT_EXCEEDED",
            message: "Tenant API rate limit exceeded. Please try again later.",
            retryAfterSeconds: Math.ceil(tenantResult.resetMs / 1000)
          },
          HttpStatus.TOO_MANY_REQUESTS
        );
      }
    }

    return true;
  }

  // Cleanup mechanism for idle stored keys
  cleanupIdleKeys() {
    const now = Date.now();
    for (const [key, hits] of this.ipWindows.entries()) {
      const cleaned = this.cleanOldHits(hits, this.config.ipWindowMs, now);
      if (cleaned.length === 0) this.ipWindows.delete(key);
      else this.ipWindows.set(key, cleaned);
    }
    for (const [key, hits] of this.tenantWindows.entries()) {
      const cleaned = this.cleanOldHits(hits, this.config.tenantWindowMs, now);
      if (cleaned.length === 0) this.tenantWindows.delete(key);
      else this.tenantWindows.set(key, cleaned);
    }
  }

  reset() {
    this.tenantWindows.clear();
    this.ipWindows.clear();
  }
}
