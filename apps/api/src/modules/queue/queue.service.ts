import {
  BadRequestException,
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit
} from "@nestjs/common";
import { Redis } from "ioredis";
import { AuditService } from "../audit/audit.service.js";
import { PrismaService } from "../prisma/prisma.service.js";

export interface QueueJobOptions {
  attempts?: number;
  backoff?: {
    type?: "exponential" | "fixed";
    delay?: number;
  };
  delay?: number;
  priority?: number;
  removeOnComplete?: boolean | number;
  removeOnFail?: boolean | number;
}

export interface DeadLetterJob {
  id: string;
  queueName: string;
  jobName: string;
  tenantId: string;
  data: Record<string, unknown>;
  failedReason?: string;
  failedAt: Date;
  attemptsMade: number;
  maxAttempts: number;
}

export interface QueueHealthStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
}

export interface QueueHealthResult {
  status: "ok" | "degraded";
  queues: Record<string, QueueHealthStats>;
}

export interface InMemoryJobRecord {
  id: string;
  name: string;
  data: Record<string, unknown>;
  opts: QueueJobOptions;
  status: "waiting" | "active" | "completed" | "failed";
  attemptsMade: number;
  maxAttempts: number;
  createdAt: Date;
  updatedAt: Date;
  failedReason?: string;
}

interface BullQueueLike {
  add(name: string, data: unknown, opts?: unknown): Promise<{ id: string | number }>;
  addBulk(jobs: Array<{ name: string; data: unknown; opts?: unknown }>): Promise<Array<{ id: string | number }>>;
  getWaitingCount(): Promise<number>;
  getActiveCount(): Promise<number>;
  getCompletedCount(): Promise<number>;
  getFailedCount(): Promise<number>;
  close(): Promise<void>;
}

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private redisClient: Redis | null = null;
  private isRedisConnected = false;
  private bullQueueClass: (new (name: string, opts: unknown) => BullQueueLike) | null = null;
  private readonly bullQueues = new Map<string, BullQueueLike>();
  private readonly inMemoryQueues = new Map<string, Map<string, InMemoryJobRecord>>();
  private readonly deadLetterJobs = new Map<string, DeadLetterJob>();

  private readonly defaultKnownQueues = [
    "email",
    "payroll",
    "payslips",
    "notifications",
    "exports",
    "compliance",
    "audit"
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService
  ) {
    for (const q of this.defaultKnownQueues) {
      if (!this.inMemoryQueues.has(q)) {
        this.inMemoryQueues.set(q, new Map());
      }
    }
  }

  async onModuleInit(): Promise<void> {
    await this.initializeBullMQModule();
    await this.initializeRedisConnection();
  }

  async onModuleDestroy(): Promise<void> {
    for (const [name, queue] of this.bullQueues.entries()) {
      try {
        if (typeof queue.close === "function") {
          await queue.close();
        }
      } catch (err: unknown) {
        this.logger.error(`Error closing queue ${name}: ${err instanceof Error ? err.message : ""}`);
      }
    }
    this.bullQueues.clear();

    if (this.redisClient) {
      try {
        this.redisClient.disconnect();
      } catch {
        // ignore disconnection error
      }
      this.redisClient = null;
    }
    this.isRedisConnected = false;
  }

  private async initializeBullMQModule(): Promise<void> {
    try {
      // Dynamic import to support environments where bullmq is dynamically loaded or bundled
      const bullModule = await import("bullmq");
      this.bullQueueClass = bullModule.Queue as (new (name: string, opts: unknown) => BullQueueLike);
    } catch {
      this.bullQueueClass = null;
    }
  }

  private async initializeRedisConnection(): Promise<void> {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    const redisDisabled = process.env.REDIS_DISABLED === "true";

    if (redisDisabled) {
      this.logger.log("REDIS_DISABLED=true configured, using in-memory queue fallback.");
      return;
    }

    try {
      this.redisClient = new Redis(redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: null,
        enableOfflineQueue: false,
        retryStrategy: () => null
      });

      await this.redisClient.connect();
      this.isRedisConnected = true;
      this.logger.log(`Connected to Redis at ${redisUrl.replace(/\/\/[^@]*@/, "//***@")}`);
    } catch (err: unknown) {
      this.logger.warn(
        `Redis connection failed (${err instanceof Error ? err.message : "Unknown error"}). Operating in in-memory fallback mode.`
      );
      this.isRedisConnected = false;
      if (this.redisClient) {
        try {
          this.redisClient.disconnect();
        } catch {
          // ignore
        }
      }
    }
  }

  private getOrCreateBullQueue(queueName: string): BullQueueLike | null {
    if (!this.bullQueueClass) {
      return null;
    }

    if (!this.bullQueues.has(queueName)) {
      const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
      const queue = new this.bullQueueClass(queueName, {
        connection: new Redis(redisUrl, {
          maxRetriesPerRequest: null,
          enableOfflineQueue: false,
          retryStrategy: () => null
        }),
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 1000
          },
          removeOnComplete: 1000,
          removeOnFail: 5000
        }
      });
      this.bullQueues.set(queueName, queue);
    }
    return this.bullQueues.get(queueName) ?? null;
  }

  private getOrCreateInMemoryQueue(queueName: string): Map<string, InMemoryJobRecord> {
    if (!this.inMemoryQueues.has(queueName)) {
      this.inMemoryQueues.set(queueName, new Map());
    }
    return this.inMemoryQueues.get(queueName)!;
  }

  private validateJobData(data: unknown): asserts data is Record<string, unknown> & { tenantId: string } {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new BadRequestException("Job data payload must be a non-null object.");
    }
    const record = data as Record<string, unknown>;
    if (!record.tenantId || typeof record.tenantId !== "string" || record.tenantId.trim() === "") {
      throw new BadRequestException("Job payload must include a valid tenantId.");
    }
  }

  private buildDefaultOptions(opts?: QueueJobOptions): QueueJobOptions {
    return {
      attempts: opts?.attempts ?? 3,
      backoff: opts?.backoff ?? {
        type: "exponential",
        delay: 1000
      },
      delay: opts?.delay ?? 0,
      removeOnComplete: opts?.removeOnComplete ?? 1000,
      removeOnFail: opts?.removeOnFail ?? 5000
    };
  }

  async addJob(
    queueName: string,
    jobName: string,
    data: unknown,
    opts?: QueueJobOptions
  ): Promise<string> {
    this.validateJobData(data);
    const resolvedOpts = this.buildDefaultOptions(opts);

    if (this.isRedisConnected && this.bullQueueClass) {
      try {
        const queue = this.getOrCreateBullQueue(queueName);
        if (queue) {
          const bullOpts = {
            attempts: resolvedOpts.attempts,
            backoff: resolvedOpts.backoff,
            delay: resolvedOpts.delay,
            priority: resolvedOpts.priority,
            removeOnComplete: resolvedOpts.removeOnComplete,
            removeOnFail: resolvedOpts.removeOnFail
          };
          const job = await queue.add(jobName, data, bullOpts);
          return String(job.id);
        }
      } catch (err: unknown) {
        this.logger.warn(`Failed to add job to Redis BullMQ queue ${queueName}, routing to in-memory: ${err instanceof Error ? err.message : ""}`);
        this.isRedisConnected = false;
      }
    }

    // In-memory fallback
    const inMemoryQueue = this.getOrCreateInMemoryQueue(queueName);
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date();

    const record: InMemoryJobRecord = {
      id: jobId,
      name: jobName,
      data: data as Record<string, unknown>,
      opts: resolvedOpts,
      status: "waiting",
      attemptsMade: 0,
      maxAttempts: resolvedOpts.attempts ?? 3,
      createdAt: now,
      updatedAt: now
    };

    inMemoryQueue.set(jobId, record);
    return jobId;
  }

  async addBulk(
    queueName: string,
    jobs: Array<{ name: string; data: unknown; opts?: QueueJobOptions }>
  ): Promise<string[]> {
    if (!Array.isArray(jobs) || jobs.length === 0) {
      return [];
    }

    for (const job of jobs) {
      this.validateJobData(job.data);
    }

    if (this.isRedisConnected && this.bullQueueClass) {
      try {
        const queue = this.getOrCreateBullQueue(queueName);
        if (queue) {
          const bullJobs = jobs.map((j) => {
            const resolvedOpts = this.buildDefaultOptions(j.opts);
            return {
              name: j.name,
              data: j.data,
              opts: {
                attempts: resolvedOpts.attempts,
                backoff: resolvedOpts.backoff,
                delay: resolvedOpts.delay,
                priority: resolvedOpts.priority,
                removeOnComplete: resolvedOpts.removeOnComplete,
                removeOnFail: resolvedOpts.removeOnFail
              }
            };
          });

          const createdJobs = await queue.addBulk(bullJobs);
          return createdJobs.map((j) => String(j.id));
        }
      } catch (err: unknown) {
        this.logger.warn(`Failed to add bulk jobs to Redis BullMQ queue ${queueName}, routing to in-memory: ${err instanceof Error ? err.message : ""}`);
        this.isRedisConnected = false;
      }
    }

    // In-memory bulk fallback
    const jobIds: string[] = [];
    for (const job of jobs) {
      const id = await this.addJob(queueName, job.name, job.data, job.opts);
      jobIds.push(id);
    }
    return jobIds;
  }

  async getQueueHealth(): Promise<QueueHealthResult> {
    const queueStats: Record<string, QueueHealthStats> = {};

    if (this.isRedisConnected && this.bullQueueClass) {
      try {
        const activeQueueNames = Array.from(
          new Set([...this.defaultKnownQueues, ...Array.from(this.bullQueues.keys())])
        );

        for (const name of activeQueueNames) {
          const queue = this.getOrCreateBullQueue(name);
          if (queue) {
            const [waiting, active, completed, failed] = await Promise.all([
              queue.getWaitingCount().catch(() => 0),
              queue.getActiveCount().catch(() => 0),
              queue.getCompletedCount().catch(() => 0),
              queue.getFailedCount().catch(() => 0)
            ]);
            queueStats[name] = { waiting, active, completed, failed };
          }
        }

        return {
          status: "ok",
          queues: queueStats
        };
      } catch (err: unknown) {
        this.logger.warn(`Error getting Redis queue stats: ${err instanceof Error ? err.message : ""}`);
        this.isRedisConnected = false;
      }
    }

    // In-memory stats
    const allQueueNames = Array.from(
      new Set([...this.defaultKnownQueues, ...Array.from(this.inMemoryQueues.keys())])
    );

    for (const name of allQueueNames) {
      const q = this.inMemoryQueues.get(name);
      if (!q) {
        queueStats[name] = { waiting: 0, active: 0, completed: 0, failed: 0 };
        continue;
      }

      let waiting = 0;
      let active = 0;
      let completed = 0;
      let failed = 0;

      for (const item of q.values()) {
        if (item.status === "waiting") waiting++;
        else if (item.status === "active") active++;
        else if (item.status === "completed") completed++;
        else if (item.status === "failed") failed++;
      }

      queueStats[name] = { waiting, active, completed, failed };
    }

    return {
      status: this.isRedisConnected ? "ok" : "degraded",
      queues: queueStats
    };
  }

  // ----------------- Dead-Letter Tracking & Failure Management -----------------

  async recordDeadLetter(
    queueName: string,
    jobId: string,
    jobName: string,
    data: Record<string, unknown> & { tenantId: string },
    failedReason?: string,
    attemptsMade = 3,
    maxAttempts = 3
  ): Promise<DeadLetterJob> {
    const deadLetterJob: DeadLetterJob = {
      id: jobId,
      queueName,
      jobName,
      tenantId: data.tenantId,
      data,
      failedReason: failedReason ?? "Exceeded maximum retry attempts",
      failedAt: new Date(),
      attemptsMade,
      maxAttempts
    };

    this.deadLetterJobs.set(jobId, deadLetterJob);

    // Update in-memory record if present
    const q = this.inMemoryQueues.get(queueName);
    if (q && q.has(jobId)) {
      const rec = q.get(jobId)!;
      rec.status = "failed";
      rec.attemptsMade = attemptsMade;
      rec.failedReason = deadLetterJob.failedReason;
      rec.updatedAt = new Date();
    }

    await this.auditService.record({
      tenantId: data.tenantId,
      action: "queue.job.dead_letter",
      resourceType: "queue_job",
      resourceId: jobId,
      after: {
        queueName,
        jobName,
        failedReason: deadLetterJob.failedReason,
        attemptsMade
      }
    });

    this.logger.warn(
      `Job ${jobId} in queue ${queueName} moved to Dead Letter Queue for tenant ${data.tenantId}: ${deadLetterJob.failedReason}`
    );

    return deadLetterJob;
  }

  async getDeadLetterJobs(queueName?: string, tenantId?: string): Promise<DeadLetterJob[]> {
    const list = Array.from(this.deadLetterJobs.values());
    return list.filter((job) => {
      if (queueName && job.queueName !== queueName) return false;
      if (tenantId && job.tenantId !== tenantId) return false;
      return true;
    });
  }

  async retryDeadLetterJob(jobId: string): Promise<boolean> {
    const deadJob = this.deadLetterJobs.get(jobId);
    if (!deadJob) {
      return false;
    }

    // Re-queue the job
    await this.addJob(deadJob.queueName, deadJob.jobName, deadJob.data, {
      attempts: deadJob.maxAttempts
    });

    // Remove from DLQ
    this.deadLetterJobs.delete(jobId);

    await this.auditService.record({
      tenantId: deadJob.tenantId,
      action: "queue.job.retried",
      resourceType: "queue_job",
      resourceId: jobId,
      after: {
        queueName: deadJob.queueName,
        jobName: deadJob.jobName
      }
    });

    return true;
  }

  async clearDeadLetters(queueName?: string): Promise<number> {
    let cleared = 0;
    for (const [id, job] of this.deadLetterJobs.entries()) {
      if (!queueName || job.queueName === queueName) {
        this.deadLetterJobs.delete(id);
        cleared++;
      }
    }
    return cleared;
  }

  // ----------------- In-Memory Simulation Helpers (for Testing & Worker simulation) -----------------

  getInMemoryJob(queueName: string, jobId: string): InMemoryJobRecord | undefined {
    return this.inMemoryQueues.get(queueName)?.get(jobId);
  }

  setRedisConnected(connected: boolean): void {
    this.isRedisConnected = connected;
  }

  getIsRedisConnected(): boolean {
    return this.isRedisConnected;
  }
}
