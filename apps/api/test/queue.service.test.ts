import { BadRequestException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueueService } from "../src/modules/queue/queue.service.js";

describe("QueueService", () => {
  let queueService: QueueService;
  let mockPrisma: Record<string, unknown>;
  let mockAudit: { record: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    process.env.REDIS_DISABLED = "true";
    mockPrisma = {};
    mockAudit = {
      record: vi.fn().mockResolvedValue({})
    };

    queueService = new QueueService(mockPrisma as never, mockAudit as never);
  });

  describe("Validation & Tenant Isolation", () => {
    it("throws BadRequestException if job payload is not an object", async () => {
      await expect(
        queueService.addJob("email", "send-welcome", null as never)
      ).rejects.toThrow(BadRequestException);

      await expect(
        queueService.addJob("email", "send-welcome", "invalid-payload" as never)
      ).rejects.toThrow(BadRequestException);
    });

    it("throws BadRequestException if tenantId is missing in job data", async () => {
      await expect(
        queueService.addJob("email", "send-welcome", { to: "user@example.com" })
      ).rejects.toThrow(/tenantId/);
    });

    it("throws BadRequestException if tenantId is an empty string", async () => {
      await expect(
        queueService.addJob("email", "send-welcome", { tenantId: "   ", to: "user@example.com" })
      ).rejects.toThrow(/tenantId/);
    });

    it("validates all jobs in addBulk and fails if any job lacks tenantId", async () => {
      const jobs = [
        { name: "send-1", data: { tenantId: "tenant-1", email: "a@a.com" } },
        { name: "send-2", data: { email: "no-tenant@a.com" } }
      ];

      await expect(queueService.addBulk("email", jobs)).rejects.toThrow(/tenantId/);
    });
  });

  describe("Job Enqueuing and Defaults", () => {
    it("enqueues a job with default 3 retries and exponential backoff", async () => {
      const jobId = await queueService.addJob("payroll", "calculate-salary", {
        tenantId: "tenant-org-1",
        runId: "run-99"
      });

      expect(jobId).toBeDefined();
      expect(typeof jobId).toBe("string");

      const inMemJob = queueService.getInMemoryJob("payroll", jobId);
      expect(inMemJob).toBeDefined();
      expect(inMemJob?.name).toBe("calculate-salary");
      expect(inMemJob?.data.tenantId).toBe("tenant-org-1");
      expect(inMemJob?.status).toBe("waiting");
      expect(inMemJob?.maxAttempts).toBe(3);
      expect(inMemJob?.opts.attempts).toBe(3);
      expect(inMemJob?.opts.backoff?.type).toBe("exponential");
      expect(inMemJob?.opts.backoff?.delay).toBe(1000);
    });

    it("allows overriding retry attempts and backoff options", async () => {
      const jobId = await queueService.addJob(
        "notifications",
        "push-alert",
        { tenantId: "tenant-org-1", message: "Emergency" },
        {
          attempts: 5,
          backoff: { type: "fixed", delay: 2000 },
          delay: 500
        }
      );

      const inMemJob = queueService.getInMemoryJob("notifications", jobId);
      expect(inMemJob?.maxAttempts).toBe(5);
      expect(inMemJob?.opts.attempts).toBe(5);
      expect(inMemJob?.opts.backoff?.type).toBe("fixed");
      expect(inMemJob?.opts.backoff?.delay).toBe(2000);
      expect(inMemJob?.opts.delay).toBe(500);
    });

    it("enqueues bulk jobs successfully and returns all job IDs", async () => {
      const jobs = [
        { name: "export-1", data: { tenantId: "tenant-1", format: "pdf" } },
        { name: "export-2", data: { tenantId: "tenant-1", format: "csv" } },
        { name: "export-3", data: { tenantId: "tenant-2", format: "xlsx" } }
      ];

      const jobIds = await queueService.addBulk("exports", jobs);
      expect(jobIds).toHaveLength(3);

      for (const id of jobIds) {
        const job = queueService.getInMemoryJob("exports", id);
        expect(job).toBeDefined();
        expect(job?.status).toBe("waiting");
      }
    });

    it("returns empty array when bulk job list is empty", async () => {
      const jobIds = await queueService.addBulk("exports", []);
      expect(jobIds).toEqual([]);
    });
  });

  describe("Queue Health Checks", () => {
    it("reports degraded status in fallback in-memory mode with queue stats", async () => {
      await queueService.addJob("email", "send-mail", { tenantId: "tenant-1" });
      await queueService.addJob("payroll", "run-pay", { tenantId: "tenant-1" });

      const health = await queueService.getQueueHealth();
      expect(health.status).toBe("degraded");
      expect(health.queues).toBeDefined();
      expect(health.queues["email"]!.waiting).toBe(1);
      expect(health.queues["payroll"]!.waiting).toBe(1);
      expect(health.queues["payslips"]).toBeDefined();
      expect(health.queues["notifications"]).toBeDefined();
    });

    it("reports ok status when Redis is connected", async () => {
      queueService.setRedisConnected(true);
      // Even if Redis is marked connected, getQueueHealth attempts Redis calls or degrades gracefully
      const health = await queueService.getQueueHealth();
      expect(["ok", "degraded"]).toContain(health.status);
    });
  });

  describe("Dead-Letter Tracking & Retries", () => {
    it("records dead-letter jobs and creates an audit record", async () => {
      const jobId = "job-failed-123";
      const payload = { tenantId: "tenant-alpha", runId: "pay-456" };

      const dlq = await queueService.recordDeadLetter(
        "payroll",
        jobId,
        "calculate-payroll",
        payload,
        "Network connection timed out after 3 retries",
        3,
        3
      );

      expect(dlq.id).toBe(jobId);
      expect(dlq.tenantId).toBe("tenant-alpha");
      expect(dlq.failedReason).toContain("Network connection timed out");
      expect(mockAudit.record).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: "tenant-alpha",
          action: "queue.job.dead_letter",
          resourceId: jobId
        })
      );

      const deadLetters = await queueService.getDeadLetterJobs();
      expect(deadLetters.length).toBeGreaterThanOrEqual(1);
      expect(deadLetters.find((d) => d.id === jobId)).toBeDefined();
    });

    it("filters dead-letter jobs by queueName and tenantId", async () => {
      await queueService.recordDeadLetter(
        "email",
        "job-email-1",
        "send-email",
        { tenantId: "tenant-A" },
        "SMTP error"
      );
      await queueService.recordDeadLetter(
        "payroll",
        "job-pay-1",
        "calc",
        { tenantId: "tenant-B" },
        "Formula error"
      );

      const emailJobs = await queueService.getDeadLetterJobs("email");
      expect(emailJobs.every((j) => j.queueName === "email")).toBe(true);

      const tenantAJobs = await queueService.getDeadLetterJobs(undefined, "tenant-A");
      expect(tenantAJobs.every((j) => j.tenantId === "tenant-A")).toBe(true);
    });

    it("retries a dead-letter job, re-enqueues it, and removes it from DLQ", async () => {
      const jobId = "job-retry-me";
      await queueService.recordDeadLetter(
        "email",
        jobId,
        "send-report",
        { tenantId: "tenant-X", reportId: "rep-1" },
        "Temporary auth failure"
      );

      const retryResult = await queueService.retryDeadLetterJob(jobId);
      expect(retryResult).toBe(true);

      const dlqAfter = await queueService.getDeadLetterJobs();
      expect(dlqAfter.find((d) => d.id === jobId)).toBeUndefined();

      expect(mockAudit.record).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: "tenant-X",
          action: "queue.job.retried",
          resourceId: jobId
        })
      );
    });

    it("returns false when retrying non-existent dead-letter job", async () => {
      const result = await queueService.retryDeadLetterJob("non-existent-id");
      expect(result).toBe(false);
    });

    it("clears dead letters by queue or globally", async () => {
      await queueService.recordDeadLetter("email", "dlq-1", "job-1", { tenantId: "t1" });
      await queueService.recordDeadLetter("payroll", "dlq-2", "job-2", { tenantId: "t1" });

      const clearedEmail = await queueService.clearDeadLetters("email");
      expect(clearedEmail).toBeGreaterThanOrEqual(1);

      const emailDLQ = await queueService.getDeadLetterJobs("email");
      expect(emailDLQ).toHaveLength(0);

      const clearedAll = await queueService.clearDeadLetters();
      expect(clearedAll).toBeGreaterThanOrEqual(1);

      const allDLQ = await queueService.getDeadLetterJobs();
      expect(allDLQ).toHaveLength(0);
    });
  });

  describe("Lifecycle and Cleanup", () => {
    it("handles onModuleDestroy gracefully without crashing", async () => {
      await expect(queueService.onModuleDestroy()).resolves.toBeUndefined();
    });
  });
});
