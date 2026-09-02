import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";

import {
  AttendanceStatus,
  LeaveRequestStatus,
  LeaveTransactionType,
  SandwichPolicyType,
  type Prisma
} from "@prisma/client";
import { AuditService } from "../audit/audit.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { LeaveBalanceEngine } from "./leave-balance.engine.js";
import { SandwichLeaveEngine } from "./sandwich-leave.engine.js";
import type {
  AdjustBalanceDto,
  CalendarQueryDto,
  CancelLeaveRequestDto,
  CreateHolidayDto,
  CreateLeaveRequestDto,
  CreateLeaveTypeDto,
  LeaveFilterDto,
  ReviewLeaveRequestDto,
  UpdateLeavePolicyDto
} from "./leaves.schemas.js";

@Injectable()
export class LeavesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService
  ) {}

  private getStartOfDay(date: Date | string): Date {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
  }

  // ----------------- Leave Types & Policies -----------------

  async listLeaveTypes(tenantId: string) {
    return this.prisma.leaveType.findMany({
      where: { tenantId, isActive: true },
      include: { policies: { where: { isActive: true } } },
      orderBy: { name: "asc" }
    });
  }

  async createLeaveType(
    tenantId: string,
    input: CreateLeaveTypeDto,
    actorUserId: string,
    actorMembershipId?: string
  ) {
    const existing = await this.prisma.leaveType.findFirst({
      where: { tenantId, code: input.code }
    });
    if (existing) {
      throw new ConflictException(`Leave type with code ${input.code} already exists.`);
    }

    const leaveType = await this.prisma.$transaction(async (tx) => {
      const created = await tx.leaveType.create({
        data: {
          tenantId,
          name: input.name,
          code: input.code,
          category: input.category,
          description: input.description,
          color: input.color,
          isPaid: input.isPaid,
          isActive: input.isActive
        }
      });

      // Create default policy for this leave type
      await tx.leavePolicy.create({
        data: {
          tenantId,
          leaveTypeId: created.id,
          annualAllocationDays: input.category === "UNPAID" ? 0 : 12,
          accrualFrequency: "MONTHLY",
          accrualDaysPerPeriod: input.category === "UNPAID" ? 0 : 1,
          maxCarryForwardDays: 0,
          sandwichPolicy: "NONE"
        }
      });

      return created;
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "leave.type.created",
      resourceType: "leave_type",
      resourceId: leaveType.id,
      after: { name: input.name, code: input.code, category: input.category }
    });

    return leaveType;
  }

  async updateLeavePolicy(
    tenantId: string,
    input: UpdateLeavePolicyDto,
    actorUserId: string,
    actorMembershipId?: string
  ) {
    const policy = await this.prisma.leavePolicy.findFirst({
      where: { tenantId, leaveTypeId: input.leaveTypeId }
    });

    const updated = policy
      ? await this.prisma.leavePolicy.update({
          where: { id: policy.id },
          data: input
        })
      : await this.prisma.leavePolicy.create({
          data: { tenantId, ...input }
        });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "leave.policy.updated",
      resourceType: "leave_policy",
      resourceId: updated.id,
      after: input
    });

    return updated;
  }

  // ----------------- Balances & Accrual -----------------

  async getEmployeeBalances(tenantId: string, employeeId: string, targetYear?: number) {
    const year = targetYear ?? new Date().getFullYear();

    // Ensure all active leave types have initialized balance records for employee
    const activeTypes = await this.prisma.leaveType.findMany({
      where: { tenantId, isActive: true },
      include: { policies: { where: { isActive: true } } }
    });

    const balances = await this.prisma.leaveBalance.findMany({
      where: { tenantId, employeeId, year },
      include: { leaveType: true }
    });

    const existingTypeIds = new Set(balances.map((b) => b.leaveTypeId));
    const missingTypes = activeTypes.filter((t) => !existingTypeIds.has(t.id));

    if (missingTypes.length > 0) {
      await this.prisma.$transaction(
        missingTypes.map((t) => {
          const defaultAlloc = t.policies[0]?.annualAllocationDays ?? 0;
          return this.prisma.leaveBalance.create({
            data: {
              tenantId,
              employeeId,
              leaveTypeId: t.id,
              year,
              allocatedDays: defaultAlloc
            }
          });
        })
      );
    }

    const finalBalances = await this.prisma.leaveBalance.findMany({
      where: { tenantId, employeeId, year },
      include: { leaveType: true }
    });

    return finalBalances.map((b) => ({
      ...b,
      availableDays: LeaveBalanceEngine.calculateAvailableDays(b)
    }));
  }

  async adjustBalance(
    tenantId: string,
    input: AdjustBalanceDto,
    actorUserId: string,
    actorMembershipId?: string
  ) {
    const balance = await this.prisma.leaveBalance.findFirst({
      where: { tenantId, employeeId: input.employeeId, leaveTypeId: input.leaveTypeId, year: input.year }
    });

    if (!balance) {
      throw new NotFoundException("Leave balance record not found for employee and year.");
    }

    const availableBefore = LeaveBalanceEngine.calculateAvailableDays(balance);
    const balanceAfter = availableBefore + input.days;

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedBal = await tx.leaveBalance.update({
        where: { id: balance.id },
        data: {
          manualAdjustedDays: { increment: input.days }
        }
      });

      await tx.leaveAccrualTransaction.create({
        data: {
          tenantId,
          employeeId: input.employeeId,
          leaveTypeId: input.leaveTypeId,
          transactionType: LeaveTransactionType.MANUAL_ADJUSTMENT,
          days: input.days,
          balanceBefore: availableBefore,
          balanceAfter,
          reason: input.reason,
          actorUserId
        }
      });

      return updatedBal;
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "leave.balance.adjusted",
      resourceType: "leave_balance",
      resourceId: balance.id,
      after: { days: input.days, reason: input.reason, balanceAfter }
    });

    return { ...updated, availableDays: LeaveBalanceEngine.calculateAvailableDays(updated) };
  }

  // ----------------- Leave Requests & Approvals -----------------

  async createLeaveRequest(
    tenantId: string,
    employeeId: string,
    input: CreateLeaveRequestDto,
    actorUserId: string,
    actorMembershipId?: string
  ) {
    const start = this.getStartOfDay(input.startDate);
    const end = this.getStartOfDay(input.endDate);

    if (start > end) {
      throw new BadRequestException("Start date cannot be after end date.");
    }

    const currentYear = start.getFullYear();

    // Check for overlapping active requests
    const overlapping = await this.prisma.leaveRequest.findFirst({
      where: {
        tenantId,
        employeeId,
        status: { in: [LeaveRequestStatus.PENDING_MANAGER, LeaveRequestStatus.PENDING_HR, LeaveRequestStatus.APPROVED] },
        OR: [
          { startDate: { lte: end }, endDate: { gte: start } }
        ]
      }
    });

    if (overlapping) {
      throw new ConflictException("You already have an active or approved leave request for the selected dates.");
    }

    // Fetch leave type, policy, and holidays
    const leaveType = await this.prisma.leaveType.findFirst({
      where: { id: input.leaveTypeId, tenantId },
      include: { policies: { where: { isActive: true } } }
    });

    if (!leaveType) {
      throw new NotFoundException("Leave type not found.");
    }

    const policy = leaveType.policies[0] ?? {
      annualAllocationDays: 12,
      allowNegativeBalance: false,
      maxNegativeBalanceDays: 0,
      maxConsecutiveDays: 15,
      requiresManagerApproval: true,
      requiresHrApproval: false,
      requiresAttachment: false,
      attachmentMandatoryAboveDays: 2,
      sandwichPolicy: SandwichPolicyType.NONE
    };

    const holidays = await this.prisma.holiday.findMany({
      where: { tenantId, date: { gte: start, lte: end } }
    });

    // Calculate effective and sandwich deducted days
    const duration = SandwichLeaveEngine.calculate({
      startDate: start,
      endDate: end,
      isHalfDay: input.isHalfDay,
      sandwichPolicy: policy.sandwichPolicy,
      holidays
    });

    if (duration.deductedDays <= 0) {
      throw new BadRequestException("Selected date range contains 0 working days.");
    }

    // Attachment validation
    if (
      (policy.requiresAttachment || duration.totalCalendarDays > policy.attachmentMandatoryAboveDays) &&
      !input.attachmentObjectKey
    ) {
      throw new BadRequestException(
        `Document attachment is mandatory for leaves exceeding ${policy.attachmentMandatoryAboveDays} days.`
      );
    }

    // Balance check
    const balances = await this.getEmployeeBalances(tenantId, employeeId, currentYear);
    const balance = balances.find((b) => b.leaveTypeId === input.leaveTypeId);

    if (!balance) {
      throw new BadRequestException("No leave balance record available for this leave type.");
    }

    const validation = LeaveBalanceEngine.validateRequest(balance, policy, duration.deductedDays);
    if (!validation.valid) {
      throw new BadRequestException(validation.reason);
    }

    // Determine initial status
    const initialStatus = policy.requiresManagerApproval
      ? LeaveRequestStatus.PENDING_MANAGER
      : policy.requiresHrApproval
      ? LeaveRequestStatus.PENDING_HR
      : LeaveRequestStatus.APPROVED;

    const request = await this.prisma.$transaction(async (tx) => {
      const created = await tx.leaveRequest.create({
        data: {
          tenantId,
          employeeId,
          leaveTypeId: input.leaveTypeId,
          startDate: start,
          endDate: end,
          isHalfDay: input.isHalfDay,
          halfDaySession: input.halfDaySession,
          totalDays: duration.totalCalendarDays,
          deductedDays: duration.deductedDays,
          reason: input.reason,
          status: initialStatus,
          attachmentObjectKey: input.attachmentObjectKey,
          metadata: {
            sandwichPenaltyDays: duration.sandwichPenaltyDays,
            sandwichPolicy: policy.sandwichPolicy
          } as Prisma.InputJsonValue
        },
        include: { leaveType: true, employee: true }
      });

      // Update pending days on balance
      if (initialStatus !== LeaveRequestStatus.APPROVED) {
        await tx.leaveBalance.update({
          where: { id: balance.id },
          data: { pendingDays: { increment: duration.deductedDays } }
        });
      } else {
        await tx.leaveBalance.update({
          where: { id: balance.id },
          data: { usedDays: { increment: duration.deductedDays } }
        });
      }

      return created;
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "leave.created",
      resourceType: "leave_request",
      resourceId: request.id,
      after: {
        employeeId,
        startDate: input.startDate,
        endDate: input.endDate,
        deductedDays: duration.deductedDays,
        status: initialStatus
      }
    });

    return request;
  }

  async reviewLeaveRequest(
    tenantId: string,
    requestId: string,
    input: ReviewLeaveRequestDto,
    approverRole: "MANAGER" | "HR_ADMIN",
    actorUserId: string,
    actorMembershipId?: string
  ) {
    const request = await this.prisma.leaveRequest.findFirst({
      where: { id: requestId, tenantId },
      include: {
        leaveType: { include: { policies: true } },
        employee: true
      }
    });

    if (!request) {
      throw new NotFoundException("Leave request not found.");
    }

    if (approverRole === "MANAGER") {
      const reviewerMembership = await this.prisma.tenantMembership.findFirst({
        where: { tenantId, userId: actorUserId },
        select: { employeeId: true }
      });
      if (reviewerMembership?.employeeId && request.employee.managerEmployeeId !== reviewerMembership.employeeId) {
        throw new ForbiddenException("You can only review leave requests for your direct reports.");
      }
    }

    if (
      request.status !== LeaveRequestStatus.PENDING_MANAGER &&
      request.status !== LeaveRequestStatus.PENDING_HR
    ) {

      throw new BadRequestException(`Leave request is already ${request.status}.`);
    }

    const policy = request.leaveType.policies[0];
    const year = request.startDate.getFullYear();
    const balance = await this.prisma.leaveBalance.findFirst({
      where: { tenantId, employeeId: request.employeeId, leaveTypeId: request.leaveTypeId, year }
    });

    let nextStatus: LeaveRequestStatus = LeaveRequestStatus.APPROVED;

    if (input.action === "REJECTED") {
      nextStatus = LeaveRequestStatus.REJECTED;
    } else if (approverRole === "MANAGER" && policy?.requiresHrApproval) {
      nextStatus = LeaveRequestStatus.PENDING_HR;
    } else {
      nextStatus = LeaveRequestStatus.APPROVED;
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedReq = await tx.leaveRequest.update({
        where: { id: requestId },
        data: {
          status: nextStatus,
          rejectionReason: input.action === "REJECTED" ? input.note : undefined
        }
      });

      await tx.leaveApproval.create({
        data: {
          tenantId,
          leaveRequestId: requestId,
          approverRole,
          approverUserId: actorUserId,
          action: input.action,
          note: input.note
        }
      });

      if (balance) {
        if (nextStatus === LeaveRequestStatus.APPROVED) {
          // Move from pending to used
          await tx.leaveBalance.update({
            where: { id: balance.id },
            data: {
              pendingDays: { decrement: request.deductedDays },
              usedDays: { increment: request.deductedDays }
            }
          });

          await tx.leaveAccrualTransaction.create({
            data: {
              tenantId,
              employeeId: request.employeeId,
              leaveTypeId: request.leaveTypeId,
              transactionType: LeaveTransactionType.USAGE,
              days: -request.deductedDays,
              balanceBefore: LeaveBalanceEngine.calculateAvailableDays(balance),
              balanceAfter: LeaveBalanceEngine.calculateAvailableDays(balance) - request.deductedDays,
              reason: `Leave approved: ${request.reason}`,
              actorUserId
            }
          });

          // PART E: Synchronize Attendance - auto-create ON_LEAVE daily records
          const curr = new Date(request.startDate);
          const end = new Date(request.endDate);
          while (curr <= end) {
            const dateOnly = this.getStartOfDay(curr);
            await tx.attendance.upsert({
              where: {
                tenantId_employeeId_date: {
                  tenantId,
                  employeeId: request.employeeId,
                  date: dateOnly
                }
              },
              create: {
                tenantId,
                employeeId: request.employeeId,
                date: dateOnly,
                status: request.isHalfDay ? AttendanceStatus.HALF_DAY : AttendanceStatus.ON_LEAVE,
                notes: `Approved leave: ${request.leaveType.name}`
              },
              update: {
                status: request.isHalfDay ? AttendanceStatus.HALF_DAY : AttendanceStatus.ON_LEAVE,
                notes: `Approved leave: ${request.leaveType.name}`
              }
            });
            curr.setUTCDate(curr.getUTCDate() + 1);
          }
        } else if (nextStatus === LeaveRequestStatus.REJECTED) {
          // Release pending days
          await tx.leaveBalance.update({
            where: { id: balance.id },
            data: { pendingDays: { decrement: request.deductedDays } }
          });
        }
      }

      return updatedReq;
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: input.action === "APPROVED" ? "leave.approved" : "leave.rejected",
      resourceType: "leave_request",
      resourceId: requestId,
      after: { status: nextStatus, approverRole, note: input.note }
    });

    return updated;
  }

  async cancelLeaveRequest(
    tenantId: string,
    requestId: string,
    employeeId: string,
    input: CancelLeaveRequestDto,
    actorUserId: string,
    actorMembershipId?: string
  ) {
    const request = await this.prisma.leaveRequest.findFirst({
      where: { id: requestId, tenantId }
    });

    if (!request) {
      throw new NotFoundException("Leave request not found.");
    }

    if (request.status === LeaveRequestStatus.REJECTED || request.status === LeaveRequestStatus.CANCELLED) {
      throw new BadRequestException(`Cannot cancel a ${request.status} leave request.`);
    }

    const year = request.startDate.getFullYear();
    const balance = await this.prisma.leaveBalance.findFirst({
      where: { tenantId, employeeId: request.employeeId, leaveTypeId: request.leaveTypeId, year }
    });

    const wasApproved = request.status === LeaveRequestStatus.APPROVED;

    const cancelled = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.leaveRequest.update({
        where: { id: requestId },
        data: {
          status: LeaveRequestStatus.CANCELLED,
          cancelledAt: new Date(),
          cancellationReason: input.reason
        }
      });

      if (balance) {
        if (wasApproved) {
          // Refund used days
          await tx.leaveBalance.update({
            where: { id: balance.id },
            data: { usedDays: { decrement: request.deductedDays } }
          });

          await tx.leaveAccrualTransaction.create({
            data: {
              tenantId,
              employeeId: request.employeeId,
              leaveTypeId: request.leaveTypeId,
              transactionType: LeaveTransactionType.CANCELLATION_REFUND,
              days: request.deductedDays,
              balanceBefore: LeaveBalanceEngine.calculateAvailableDays(balance),
              balanceAfter: LeaveBalanceEngine.calculateAvailableDays(balance) + request.deductedDays,
              reason: `Leave cancelled refund: ${input.reason}`,
              actorUserId
            }
          });
        } else {
          // Release pending days
          await tx.leaveBalance.update({
            where: { id: balance.id },
            data: { pendingDays: { decrement: request.deductedDays } }
          });
        }
      }

      return updated;
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "leave.cancelled",
      resourceType: "leave_request",
      resourceId: requestId,
      after: { cancellationReason: input.reason, wasApproved }
    });

    return cancelled;
  }

  // ----------------- Queries, Calendars & Holidays -----------------

  async listLeaveRequests(tenantId: string, filters: LeaveFilterDto) {
    const where: Prisma.LeaveRequestWhereInput = {
      tenantId,
      ...(filters.employeeId ? { employeeId: filters.employeeId } : {}),
      ...(filters.leaveTypeId ? { leaveTypeId: filters.leaveTypeId } : {}),
      ...(filters.status ? { status: filters.status } : {})
    };

    const [requests, total] = await Promise.all([
      this.prisma.leaveRequest.findMany({
        where,
        include: {
          leaveType: true,
          employee: {
            select: {
              id: true,
              employeeCode: true,
              fullName: true,
              department: { select: { name: true } },
              designation: { select: { name: true } }
            }
          },
          approvals: {
            include: { approverUser: { select: { email: true } } }
          }
        },
        orderBy: { createdAt: "desc" },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit
      }),
      this.prisma.leaveRequest.count({ where })
    ]);

    return { requests, total, page: filters.page, limit: filters.limit };
  }

  async getCalendarEvents(tenantId: string, query: CalendarQueryDto) {
    const start = this.getStartOfDay(query.startDate);
    const end = this.getStartOfDay(query.endDate);

    const [holidays, leaves] = await Promise.all([
      this.prisma.holiday.findMany({
        where: { tenantId, date: { gte: start, lte: end } }
      }),
      this.prisma.leaveRequest.findMany({
        where: {
          tenantId,
          status: LeaveRequestStatus.APPROVED,
          startDate: { lte: end },
          endDate: { gte: start },
          ...(query.departmentId
            ? { employee: { departmentId: query.departmentId } }
            : {})
        },
        include: {
          employee: { select: { id: true, fullName: true, employeeCode: true } },
          leaveType: true
        }
      })
    ]);

    const events: Array<{
      id: string;
      title: string;
      date: string;
      endDate?: string;
      type: "LEAVE" | "HOLIDAY";
      employeeName?: string;
      color: string;
    }> = [];

    for (const h of holidays) {
      events.push({
        id: h.id,
        title: h.name,
        date: h.date.toISOString().split("T")[0] ?? "",
        type: "HOLIDAY",
        color: "#F59E0B"
      });
    }

    for (const l of leaves) {
      events.push({
        id: l.id,
        title: `${l.employee.fullName} (${l.leaveType.code})`,
        date: l.startDate.toISOString().split("T")[0] ?? "",
        endDate: l.endDate.toISOString().split("T")[0] ?? "",
        type: "LEAVE",
        employeeName: l.employee.fullName,
        color: l.leaveType.color
      });
    }

    return events;
  }

  async listHolidays(tenantId: string, year?: number) {
    const targetYear = year ?? new Date().getFullYear();
    const start = new Date(Date.UTC(targetYear, 0, 1));
    const end = new Date(Date.UTC(targetYear, 11, 31, 23, 59, 59));

    return this.prisma.holiday.findMany({
      where: { tenantId, date: { gte: start, lte: end } },
      orderBy: { date: "asc" }
    });
  }

  async createHoliday(
    tenantId: string,
    input: CreateHolidayDto,
    actorUserId: string,
    actorMembershipId?: string
  ) {
    const date = this.getStartOfDay(input.date);
    const existing = await this.prisma.holiday.findFirst({ where: { tenantId, date } });
    if (existing) {
      throw new ConflictException("A holiday already exists on this date.");
    }

    const holiday = await this.prisma.holiday.create({
      data: {
        tenantId,
        name: input.name,
        date,
        isOptional: input.isOptional,
        description: input.description
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "holiday.created",
      resourceType: "holiday",
      resourceId: holiday.id,
      after: input
    });

    return holiday;
  }

  async deleteHoliday(
    tenantId: string,
    holidayId: string,
    actorUserId: string,
    actorMembershipId?: string
  ) {
    const holiday = await this.prisma.holiday.findFirst({ where: { id: holidayId, tenantId } });
    if (!holiday) {
      throw new NotFoundException("Holiday not found.");
    }

    await this.prisma.holiday.delete({ where: { id: holidayId } });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "holiday.deleted",
      resourceType: "holiday",
      resourceId: holidayId,
      before: { name: holiday.name, date: holiday.date }
    });

    return { success: true };
  }

  /**
   * PART E.5: Checks if an employee has an approved leave on a given date to prevent check-in conflicts.
   */
  async checkApprovedLeaveForDate(tenantId: string, employeeId: string, date: Date) {
    const dateOnly = this.getStartOfDay(date);
    const approvedLeave = await this.prisma.leaveRequest.findFirst({
      where: {
        tenantId,
        employeeId,
        status: LeaveRequestStatus.APPROVED,
        startDate: { lte: dateOnly },
        endDate: { gte: dateOnly }
      },
      include: { leaveType: true }
    });

    return approvedLeave;
  }
}
