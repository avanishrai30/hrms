import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { PrismaService } from "../prisma/prisma.service.js";
import { QueueService } from "../queue/queue.service.js";
import { Public } from "../rbac/permissions.decorator.js";

@Public()
@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: "Liveness probe verifying service is running" })
  @ApiResponse({ status: 200, description: "Service is live" })
  getLiveness() {
    return {
      status: "ok" as const,
      timestamp: new Date().toISOString()
    };
  }

  @Public()
  @Get("ready")
  @ApiOperation({ summary: "Readiness probe verifying DB and Queue connectivity" })
  @ApiResponse({ status: 200, description: "Readiness probe results" })
  async getReadiness() {
    let database: "connected" | "disconnected" = "connected";
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      database = "disconnected";
    }

    let queue: "ready" | "degraded" = "ready";
    try {
      const queueHealth = await this.queueService.getQueueHealth();
      queue = queueHealth.status === "ok" ? "ready" : "degraded";
    } catch {
      queue = "degraded";
    }

    const isHealthy = database === "connected" && queue === "ready";

    return {
      status: isHealthy ? ("ok" as const) : ("degraded" as const),
      database,
      queue,
      timestamp: new Date().toISOString()
    };
  }

  @Public()
  @Get("system")
  @ApiOperation({ summary: "System health and resource metrics" })
  @ApiResponse({ status: 200, description: "System resource health statistics" })
  async getSystemHealth() {
    let database: "connected" | "disconnected" = "connected";
    let dbLatencyMs = 0;
    try {
      const t0 = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - t0;
    } catch {
      database = "disconnected";
    }

    let queueHealth: { status: string; queues?: Record<string, unknown> } = { status: "ready", queues: {} };
    try {
      queueHealth = await this.queueService.getQueueHealth();
    } catch {
      queueHealth = { status: "degraded", queues: {} };
    }

    const memoryUsage = process.memoryUsage();
    const uptimeSeconds = process.uptime();

    return {
      status: database === "connected" && queueHealth.status === "ok" ? ("ok" as const) : ("degraded" as const),
      timestamp: new Date().toISOString(),
      database: {
        status: database,
        latencyMs: dbLatencyMs
      },
      queue: queueHealth,
      memory: {
        rssBytes: memoryUsage.rss,
        heapTotalBytes: memoryUsage.heapTotal,
        heapUsedBytes: memoryUsage.heapUsed,
        externalBytes: memoryUsage.external
      },
      uptimeSeconds: Math.round(uptimeSeconds),
      environment: process.env.NODE_ENV ?? "development",
      version: "0.1.0"
    };
  }
}
