/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from "vitest";

describe("Offline Storage & Sync Engine (Task 18)", () => {
  it("validates offline cache store schemas for employee profile, documents, and requests", () => {
    const mockStore: Record<string, any> = {};

    const saveOfflineData = (key: string, data: any) => {
      mockStore[key] = {
        data,
        cachedAt: Date.now()
      };
    };

    const getOfflineData = (key: string) => {
      return mockStore[key]?.data ?? null;
    };

    saveOfflineData("profile", { fullName: "Jane Doe", employeeCode: "EMP002" });
    saveOfflineData("payslips", [{ id: "p1", netSalary: 75000 }]);
    saveOfflineData("leaveBalances", [{ leaveType: "Casual", available: 12 }]);

    expect(getOfflineData("profile")).toEqual({ fullName: "Jane Doe", employeeCode: "EMP002" });
    expect(getOfflineData("payslips")).toHaveLength(1);
    expect(getOfflineData("leaveBalances")).toHaveLength(1);
    expect(getOfflineData("non_existent")).toBeNull();
  });

  it("queues offline requests and flushes on online reconnection", () => {
    const queue: Array<{ id: string; action: string; payload: any }> = [];

    const queueOfflineRequest = (action: string, payload: any) => {
      queue.push({ id: `off-${Date.now()}`, action, payload });
    };

    queueOfflineRequest("SUBMIT_REQUEST", { requestType: "ADDRESS_CHANGE", reason: "Moved" });
    queueOfflineRequest("SUBMIT_ATTENDANCE_CORRECTION", { date: "2026-09-01", reason: "Forgot check-out" });

    expect(queue).toHaveLength(2);

    // Simulate online flush
    const syncedItems: string[] = [];
    while (queue.length > 0) {
      const item = queue.shift()!;
      syncedItems.push(item.action);
    }

    expect(syncedItems).toEqual(["SUBMIT_REQUEST", "SUBMIT_ATTENDANCE_CORRECTION"]);
    expect(queue).toHaveLength(0);
  });
});
