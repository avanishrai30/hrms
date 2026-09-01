import { beforeEach, describe, expect, it, vi } from "vitest";
import { HealthController } from "../src/modules/health/health.controller.js";

describe("HealthController", () => {
  let controller: HealthController;
  let mockPrisma: { $queryRaw: ReturnType<typeof vi.fn> };
  let mockQueueService: { getQueueHealth: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockPrisma = {
      $queryRaw: vi.fn().mockResolvedValue([{ 1: 1 }])
    };

    mockQueueService = {
      getQueueHealth: vi.fn().mockResolvedValue({
        status: "ok",
        queues: { email: { waiting: 0, active: 0, completed: 0, failed: 0 } }
      })
    };

    controller = new HealthController(mockPrisma as never, mockQueueService as never);
  });

  describe("Liveness Probe (GET /health)", () => {
    it("returns status ok and an ISO timestamp", () => {
      const response = controller.getLiveness();
      expect(response.status).toBe("ok");
      expect(response.timestamp).toBeDefined();
      expect(new Date(response.timestamp).toISOString()).toBe(response.timestamp);
    });
  });

  describe("Readiness Probe (GET /health/ready)", () => {
    it("returns status ok when database is connected and queue is ready", async () => {
      const response = await controller.getReadiness();

      expect(response.status).toBe("ok");
      expect(response.database).toBe("connected");
      expect(response.queue).toBe("ready");
      expect(response.timestamp).toBeDefined();
      expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
      expect(mockQueueService.getQueueHealth).toHaveBeenCalledTimes(1);
    });

    it("returns status degraded when database is disconnected", async () => {
      mockPrisma.$queryRaw.mockRejectedValueOnce(new Error("Connection refused"));

      const response = await controller.getReadiness();

      expect(response.status).toBe("degraded");
      expect(response.database).toBe("disconnected");
      expect(response.queue).toBe("ready");
    });

    it("returns status degraded when queue service reports degraded status", async () => {
      mockQueueService.getQueueHealth.mockResolvedValueOnce({
        status: "degraded",
        queues: {}
      });

      const response = await controller.getReadiness();

      expect(response.status).toBe("degraded");
      expect(response.database).toBe("connected");
      expect(response.queue).toBe("degraded");
    });

    it("returns status degraded when queue service throws an error", async () => {
      mockQueueService.getQueueHealth.mockRejectedValueOnce(new Error("Redis offline"));

      const response = await controller.getReadiness();

      expect(response.status).toBe("degraded");
      expect(response.database).toBe("connected");
      expect(response.queue).toBe("degraded");
    });

    it("returns status degraded when both database and queue fail", async () => {
      mockPrisma.$queryRaw.mockRejectedValueOnce(new Error("DB Down"));
      mockQueueService.getQueueHealth.mockRejectedValueOnce(new Error("Redis Down"));

      const response = await controller.getReadiness();

      expect(response.status).toBe("degraded");
      expect(response.database).toBe("disconnected");
      expect(response.queue).toBe("degraded");
    });
  });
});
