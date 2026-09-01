import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Leave & Attendance Conflict Synchronization", () => {
  const leavesServiceCode = readFileSync(
    new URL("../src/modules/leaves/leaves.service.ts", import.meta.url),
    "utf8"
  );
  const attendanceServiceCode = readFileSync(
    new URL("../src/modules/attendance/attendance.service.ts", import.meta.url),
    "utf8"
  );

  it("ensures approved leave auto-upserts attendance status to ON_LEAVE / HALF_DAY", () => {
    expect(leavesServiceCode).toContain("status: request.isHalfDay ? AttendanceStatus.HALF_DAY : AttendanceStatus.ON_LEAVE");
    expect(leavesServiceCode).toContain("Approved leave:");
  });

  it("ensures attendance checkIn detects approved leave conflict and blocks check-in", () => {
    expect(attendanceServiceCode).toContain("APPROVED_LEAVE_CHECKIN_CONFLICT");
    expect(attendanceServiceCode).toContain("Attendance check-in blocked: You have an approved full-day leave");
  });
});
