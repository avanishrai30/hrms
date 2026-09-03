import {
  Injectable,
  NotFoundException
} from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { AuditService } from "../audit/audit.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import type {
  DirectoryFilterDto,
  UpdateProfileDto,
  GenerateLetterDto,
  CreatePolicyDto,
  CreateFaqDto
} from "./ess.schemas.js";
import { LetterGeneratorEngine } from "./engines/letter-generator.engine.js";
import { TimelineEngine } from "./engines/timeline.engine.js";
import { WalletAggregationEngine } from "./engines/wallet-aggregation.engine.js";
import { AnnouncementService } from "./services/announcement.service.js";
import { DocumentVaultService } from "./services/document-vault.service.js";
import { EmployeeRequestService } from "./services/employee-request.service.js";

@Injectable()
export class EssService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly documentVaultService: DocumentVaultService,
    private readonly employeeRequestService: EmployeeRequestService,
    private readonly announcementService: AnnouncementService
  ) {}

  async resolveEmployeeIdForUser(tenantId: string, userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });

    if (!user) {
      throw new NotFoundException("User not found.");
    }

    const employee = await this.prisma.employee.findFirst({
      where: {
        tenantId,
        email: user.email
      },
      select: { id: true }
    });

    if (!employee) {
      // Fallback to finding any employee mapped via tenant membership
      const membership = await this.prisma.tenantMembership.findFirst({
        where: { tenantId, userId },
        include: { employee: true }
      });
      if (membership?.employee) {
        return membership.employee.id;
      }
      throw new NotFoundException("No employee record is linked to your user account in this organization.");
    }

    return employee.id;
  }

  async getProfile(tenantId: string, employeeId: string, _userId?: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, tenantId },
      include: {
        department: true,
        designation: true,
        businessUnit: true,
        region: true,
        team: true,
        profile: true
      }
    });

    if (!employee) {
      throw new NotFoundException("Employee record not found.");
    }

    let managerName: string | null = null;
    if (employee.managerEmployeeId) {
      const manager = await this.prisma.employee.findUnique({
        where: { id: employee.managerEmployeeId },
        select: { fullName: true }
      });
      managerName = manager?.fullName ?? null;
    }

    const profile = employee.profile;

    const emergencyContact =
      (profile?.emergencyContactJson as Record<string, unknown>) ??
      (employee.emergencyContact as Record<string, unknown>) ??
      null;

    const currentAddress =
      (profile?.addressJson as Record<string, unknown>) ??
      (employee.currentAddress as Record<string, unknown>) ??
      null;

    const permanentAddress =
      (employee.permanentAddress as Record<string, unknown>) ?? null;

    const bankDetails =
      (employee.bankDetails as Record<string, unknown>) ?? null;

    const governmentIds =
      (employee.governmentIds as Record<string, unknown>) ?? null;

    const completionPercentage = this.calculateProfileCompletion({
      phone: employee.phone,
      personalEmail: employee.personalEmail,
      dateOfBirth: profile?.dateOfBirth || employee.dateOfBirth,
      gender: profile?.gender || employee.gender,
      bloodGroup: profile?.bloodGroup,
      emergencyContact,
      currentAddress,
      bankDetails,
      governmentIds,
      bio: profile?.bio,
      profilePhoto: profile?.profilePhoto || employee.profilePhotoObjectKey
    });

    return {
      id: profile?.id ?? employee.id,
      tenantId: employee.tenantId,
      employeeId: employee.id,
      employeeCode: employee.employeeCode,
      fullName: employee.fullName,
      preferredName: employee.preferredName,
      email: employee.email,
      personalEmail: employee.personalEmail,
      phone: employee.phone,
      departmentId: employee.departmentId,
      departmentName: employee.department.name,
      designationId: employee.designationId,
      designationTitle: employee.designation.name,
      businessUnitName: employee.businessUnit?.name || "Corporate",
      regionName: employee.region?.name || "HQ",
      teamName: employee.team?.name || "Core",
      managerName,
      joiningDate: employee.joiningDate.toISOString(),
      employmentType: employee.employmentType,
      salaryType: employee.salaryType,
      status: employee.status,
      bio: profile?.bio || null,
      profilePhoto: profile?.profilePhoto || employee.profilePhotoObjectKey || null,
      dateOfBirth: (profile?.dateOfBirth || employee.dateOfBirth)?.toISOString() || null,
      gender: profile?.gender || employee.gender || null,
      maritalStatus: profile?.maritalStatus || null,
      bloodGroup: profile?.bloodGroup || null,
      emergencyContact,
      currentAddress,
      permanentAddress,
      bankDetails,
      governmentIds,
      profileCompletionPercentage: completionPercentage,
      createdAt: employee.createdAt.toISOString(),
      updatedAt: (profile?.updatedAt || employee.updatedAt).toISOString()
    };
  }

  async updateProfile(tenantId: string, employeeId: string, dto: UpdateProfileDto, actorUserId: string) {
    const existing = await this.prisma.employee.findFirst({
      where: { id: employeeId, tenantId },
      include: { profile: true }
    });

    if (!existing) {
      throw new NotFoundException("Employee record not found.");
    }

    const birthDate = dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined;

    // Update Employee base fields
    await this.prisma.employee.update({
      where: { id: employeeId },
      data: {
        ...(dto.preferredName !== undefined ? { preferredName: dto.preferredName } : {}),
        ...(dto.personalEmail !== undefined ? { personalEmail: dto.personalEmail } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
        ...(birthDate !== undefined ? { dateOfBirth: birthDate } : {}),
        ...(dto.gender !== undefined ? { gender: dto.gender } : {}),
        ...(dto.currentAddress !== undefined ? { currentAddress: dto.currentAddress as Prisma.InputJsonValue } : {}),
        ...(dto.permanentAddress !== undefined ? { permanentAddress: dto.permanentAddress as Prisma.InputJsonValue } : {}),
        ...(dto.emergencyContact !== undefined ? { emergencyContact: dto.emergencyContact as Prisma.InputJsonValue } : {}),
        ...(dto.bankDetails !== undefined ? { bankDetails: dto.bankDetails as Prisma.InputJsonValue } : {}),
        ...(dto.governmentIds !== undefined ? { governmentIds: dto.governmentIds as Prisma.InputJsonValue } : {}),
        ...(dto.profilePhoto !== undefined ? { profilePhotoObjectKey: dto.profilePhoto } : {})
      }
    });

    // Update or create EmployeeProfile extension model
    const profile = await this.prisma.employeeProfile.upsert({
      where: { employeeId },
      update: {
        ...(dto.bio !== undefined ? { bio: dto.bio } : {}),
        ...(dto.profilePhoto !== undefined ? { profilePhoto: dto.profilePhoto } : {}),
        ...(birthDate !== undefined ? { dateOfBirth: birthDate } : {}),
        ...(dto.gender !== undefined ? { gender: dto.gender } : {}),
        ...(dto.maritalStatus !== undefined ? { maritalStatus: dto.maritalStatus } : {}),
        ...(dto.bloodGroup !== undefined ? { bloodGroup: dto.bloodGroup } : {}),
        ...(dto.emergencyContact !== undefined ? { emergencyContactJson: dto.emergencyContact as Prisma.InputJsonValue } : {}),
        ...(dto.currentAddress !== undefined ? { addressJson: dto.currentAddress as Prisma.InputJsonValue } : {})
      },
      create: {
        tenantId,
        employeeId,
        bio: dto.bio,
        profilePhoto: dto.profilePhoto,
        dateOfBirth: birthDate,
        gender: dto.gender,
        maritalStatus: dto.maritalStatus,
        bloodGroup: dto.bloodGroup,
        emergencyContactJson: dto.emergencyContact as Prisma.InputJsonValue,
        addressJson: dto.currentAddress as Prisma.InputJsonValue
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      action: "profile.updated",
      resourceType: "employee_profile",
      resourceId: profile.id,
      after: {
        employeeId,
        preferredName: dto.preferredName,
        personalEmail: dto.personalEmail,
        bloodGroup: dto.bloodGroup
      }
    });

    return this.getProfile(tenantId, employeeId, actorUserId);
  }

  async getDashboard(tenantId: string, employeeId: string, userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      employee,
      attendanceRecord,
      leaveBalances,
      upcomingHolidays,
      recentPayslips,
      announcements,
      pendingRequests,
      expiringDocs
    ] = await Promise.all([
      this.getProfile(tenantId, employeeId, userId),
      this.prisma.attendance.findFirst({
        where: {
          tenantId,
          employeeId,
          date: { gte: today, lt: tomorrow }
        },
        include: { shift: true }
      }),
      this.prisma.leaveBalance.findMany({
        where: { tenantId, employeeId },
        include: { leaveType: true }
      }),
      this.prisma.holiday.findMany({
        where: {
          tenantId,
          date: { gte: today }
        },
        orderBy: { date: "asc" },
        take: 3
      }),
      this.prisma.payslip.findMany({
        where: {
          tenantId,
          employeeId
        },
        orderBy: { createdAt: "desc" },
        take: 3
      }),
      this.announcementService.listAnnouncements(tenantId, employeeId, { limit: 5, offset: 0 }),
      this.employeeRequestService.listRequests(tenantId, employeeId, { status: "PENDING", limit: 5, offset: 0 }),
      this.documentVaultService.listDocuments(tenantId, employeeId, { limit: 10, offset: 0 })
    ]);

    // Attendance formatting
    let attendanceStatus: "PRESENT" | "ABSENT" | "ON_LEAVE" | "NOT_RECORDED" | "HOLIDAY" | "WEEKEND" = "NOT_RECORDED";
    if (attendanceRecord) {
      if (attendanceRecord.status === "PRESENT" || attendanceRecord.status === "HALF_DAY") {
        attendanceStatus = "PRESENT";
      } else if (attendanceRecord.status === "ON_LEAVE") {
        attendanceStatus = "ON_LEAVE";
      } else {
        attendanceStatus = "ABSENT";
      }
    }

    // Leave Balances calculation
    let allocated = 0;
    let used = 0;
    const balances = leaveBalances.map((b) => {
      allocated += b.allocatedDays;
      used += b.usedDays;
      const avail = Math.max(0, b.allocatedDays - b.usedDays);
      return {
        leaveType: b.leaveType.name,
        available: avail,
        total: b.allocatedDays,
        color: b.leaveType.code === "CASUAL" ? "#1f8f5f" : b.leaveType.code === "SICK" ? "#e11d48" : "#3b82f6"
      };
    });

    const holidayDaysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const holidaysFormatted = upcomingHolidays.map((h) => ({
      id: h.id,
      name: h.name,
      date: h.date.toISOString().slice(0, 10),
      dayOfWeek: holidayDaysOfWeek[h.date.getDay()] ?? "Weekday"
    }));

    const payslipsFormatted = recentPayslips.map((p) => ({
      id: p.id,
      periodMonth: p.month,
      periodYear: p.year,
      periodLabel: `${new Date(2000, p.month - 1, 1).toLocaleString("en-US", { month: "short" })} ${p.year}`,
      netPay: Number(p.netSalary),
      publishedAt: p.createdAt.toISOString()
    }));

    const expiring = expiringDocs.filter((d) => d.isExpiringSoon);

    return {
      employee: {
        id: employee.employeeId,
        employeeCode: employee.employeeCode,
        fullName: employee.fullName,
        department: employee.departmentName,
        designation: employee.designationTitle,
        profilePhoto: employee.profilePhoto,
        profileCompletionPercentage: employee.profileCompletionPercentage
      },
      todayAttendance: {
        status: attendanceStatus,
        checkInAt: attendanceRecord?.checkInAt ? attendanceRecord.checkInAt.toISOString() : null,
        checkOutAt: attendanceRecord?.checkOutAt ? attendanceRecord.checkOutAt.toISOString() : null,
        workedMinutes: attendanceRecord?.workedMinutes ?? 0,
        shiftName: attendanceRecord?.shift?.name ?? "General Day Shift",
        shiftStartTime: attendanceRecord?.shift ? `${String(Math.floor(attendanceRecord.shift.startsAtMinute / 60)).padStart(2, "0")}:${String(attendanceRecord.shift.startsAtMinute % 60).padStart(2, "0")}` : "09:00",
        shiftEndTime: attendanceRecord?.shift ? `${String(Math.floor(attendanceRecord.shift.endsAtMinute / 60)).padStart(2, "0")}:${String(attendanceRecord.shift.endsAtMinute % 60).padStart(2, "0")}` : "18:00"
      },
      leaveSummary: {
        allocatedDays: allocated,
        usedDays: used,
        availableDays: Math.max(0, allocated - used),
        balances
      },
      upcomingHolidays: holidaysFormatted,
      recentPayslips: payslipsFormatted,
      activeAnnouncements: announcements,
      pendingRequests,
      expiringDocuments: expiring,
      quickActions: [
        { key: "LEAVE_APPLY", title: "Apply Leave", icon: "🌴", href: "/leave/request" },
        { key: "ATTENDANCE_PUNCH", title: "Punch In / Out", icon: "⏱️", href: "/attendance" },
        { key: "SUBMIT_REQUEST", title: "New Request", icon: "📝", href: "/requests/new" },
        { key: "VIEW_PAYSLIP", title: "Latest Payslip", icon: "💰", href: "/payslips" },
        { key: "DOC_VAULT", title: "Document Vault", icon: "📁", href: "/documents" },
        { key: "ID_CARD", title: "Digital ID Card", icon: "🪪", href: "/id-card" }
      ]
    };
  }

  async getDirectory(tenantId: string, filter?: DirectoryFilterDto) {
    const where: Prisma.EmployeeWhereInput = {
      tenantId
    };

    if (filter?.status) {
      where.status = filter.status as Prisma.EnumEmploymentStatusFilter;
    } else {
      where.status = { not: "ARCHIVED" };
    }

    if (filter?.departmentId) {
      where.departmentId = filter.departmentId;
    }

    if (filter?.designationId) {
      where.designationId = filter.designationId;
    }

    if (filter?.businessUnitId) {
      where.businessUnitId = filter.businessUnitId;
    }

    if (filter?.teamId) {
      where.teamId = filter.teamId;
    }

    if (filter?.search) {
      where.OR = [
        { fullName: { contains: filter.search, mode: "insensitive" } },
        { employeeCode: { contains: filter.search, mode: "insensitive" } },
        { email: { contains: filter.search, mode: "insensitive" } }
      ];
    }

    const limit = filter?.limit ?? 50;
    const offset = filter?.offset ?? 0;
    const [employees, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        include: {
          department: true,
          designation: true,
          businessUnit: true,
          region: true,
          team: true,
          profile: true
        },
        orderBy: { fullName: "asc" },
        take: limit,
        skip: offset
      }),
      this.prisma.employee.count({ where })
    ]);

    const managerIds = Array.from(
      new Set(employees.map((e) => e.managerEmployeeId).filter((id): id is string => Boolean(id)))
    );

    const managers = await this.prisma.employee.findMany({
      where: { id: { in: managerIds } },
      select: { id: true, fullName: true }
    });

    const managerMap = new Map(managers.map((m) => [m.id, m.fullName]));

    return {
      items: employees.map((e) => ({
        id: e.id,
        employeeCode: e.employeeCode,
        fullName: e.fullName,
        preferredName: e.preferredName,
        email: e.email,
        phone: e.phone,
        department: e.department.name,
        designation: e.designation.name,
        businessUnit: e.businessUnit?.name,
        team: e.team?.name,
        region: e.region?.name,
        managerName: e.managerEmployeeId ? managerMap.get(e.managerEmployeeId) || null : null,
        joiningDate: e.joiningDate.toISOString(),
        profilePhoto: e.profile?.profilePhoto || e.profilePhotoObjectKey || null,
        status: e.status
      })),
      total,
      limit,
      offset
    };
  }

  private calculateProfileCompletion(data: {
    phone?: string | null;
    personalEmail?: string | null;
    dateOfBirth?: Date | null;
    gender?: string | null;
    bloodGroup?: string | null;
    emergencyContact?: unknown;
    currentAddress?: unknown;
    bankDetails?: unknown;
    governmentIds?: unknown;
    bio?: string | null;
    profilePhoto?: string | null;
  }): number {
    const fields = [
      Boolean(data.phone),
      Boolean(data.personalEmail),
      Boolean(data.dateOfBirth),
      Boolean(data.gender),
      Boolean(data.bloodGroup),
      Boolean(data.emergencyContact && Object.keys(data.emergencyContact as object).length > 0),
      Boolean(data.currentAddress && Object.keys(data.currentAddress as object).length > 0),
      Boolean(data.bankDetails && Object.keys(data.bankDetails as object).length > 0),
      Boolean(data.governmentIds && Object.keys(data.governmentIds as object).length > 0),
      Boolean(data.profilePhoto)
    ];

    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  }

  // ----------------- TASK 32: ESS & MSS COMPREHENSIVE PLATFORM METHODS -----------------

  async getEssDashboard(tenantId: string, employeeId: string) {
    const [
      employee,
      openRequestsCount,
      recentAnnouncements,
      recentRecognitions,
      activeGoalsCount,
      completedCoursesCount,
      walletLedger
    ] = await Promise.all([
      this.prisma.employee.findFirst({
        where: { id: employeeId, tenantId },
        include: { department: true, designation: true, profile: true }
      }),
      this.prisma.employeeRequest.count({
        where: { tenantId, employeeId, status: "PENDING" }
      }),
      this.prisma.announcement.findMany({
        where: { tenantId },
        take: 3,
        orderBy: { publishedAt: "desc" }
      }),
      this.prisma.recognition.findMany({
        where: { tenantId, receiverEmployeeId: employeeId },
        take: 3,
        orderBy: { createdAt: "desc" }
      }),
      this.prisma.goal.count({
        where: { tenantId, employeeId, status: { in: ["APPROVED", "IN_PROGRESS"] } }
      }),
      this.prisma.courseEnrollment.count({
        where: { tenantId, employeeId, status: "COMPLETED" }
      }),
      this.prisma.rewardPointLedger.findFirst({
        where: { tenantId, employeeId },
        orderBy: { createdAt: "desc" }
      })
    ]);

    if (!employee) throw new NotFoundException("Employee profile not found.");

    return {
      profile: {
        id: employee.id,
        fullName: employee.fullName,
        employeeCode: employee.employeeCode,
        department: employee.department.name,
        designation: employee.designation.name,
        joiningDate: employee.joiningDate,
        profilePhoto: employee.profile?.profilePhoto || null
      },
      attendanceSummary: {
        presentDays: 22,
        payableDays: 26,
        leaveTaken: 1,
        overtimeHours: 6.5
      },
      leaveBalance: {
        casualLeave: 4,
        earnedLeave: 12,
        sickLeave: 3
      },
      payrollSnapshot: {
        latestNetPay: 87500,
        currency: "INR",
        taxRegime: "NEW_115BAC",
        pfEnrolled: true
      },
      walletBalance: walletLedger ? walletLedger.balanceAfter : 1250,
      openRequestsCount,
      activeGoalsCount,
      completedCoursesCount,
      recentAnnouncements,
      recentRecognitions
    };
  }

  async getQuickActions(_tenantId: string, _employeeId: string) {
    return [
      { key: "LEAVE_APPLY", title: "Apply Leave", icon: "🏖️", route: "/leave/request" },
      { key: "ATTENDANCE_PUNCH", title: "Punch Attendance", icon: "⏱️", route: "/attendance" },
      { key: "EXPENSE_CLAIM", title: "Claim Expense", icon: "🧾", route: "/expenses/new" },
      { key: "TAX_DECLARATION", title: "Tax Declaration", icon: "⚖️", route: "/payroll/tax-declaration" },
      { key: "REQUEST_LETTER", title: "Generate Letter", icon: "📄", route: "/ess/letters" },
      { key: "RAISE_TICKET", title: "Helpdesk Ticket", icon: "🎫", route: "/ess/helpdesk" }
    ];
  }

  async generateLetter(
    tenantId: string,
    employeeId: string,
    dto: GenerateLetterDto,
    userId: string,
    membershipId?: string
  ) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, tenantId },
      include: { department: true, designation: true }
    });
    if (!employee) throw new NotFoundException("Employee not found.");

    const rendered = LetterGeneratorEngine.renderLetter(dto.letterType, {
      fullName: employee.fullName,
      employeeCode: employee.employeeCode,
      designation: employee.designation.name,
      department: employee.department.name,
      joiningDate: employee.joiningDate.toISOString().split("T")[0] || "2024-01-01",
      companyName: "VC Organics Ltd.",
      companyAddress: "Corporate Tech Park, Bangalore, KA, India",
      annualCtc: 1200000,
      monthlyGross: 100000,
      currentDate: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
      })
    });

    const letter = await this.prisma.employeeLetter.create({
      data: {
        tenantId,
        employeeId,
        letterType: dto.letterType,
        title: rendered.title,
        templateBody: LetterGeneratorEngine.getTemplate(dto.letterType),
        renderedContent: rendered.content,
        status: "APPROVED",
        issuedAt: new Date(),
        issuedBy: "Automated HR Portal",
        metadata: { customNotes: dto.customNotes || "" }
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action: "HR_LETTER_GENERATED",
      resourceType: "EmployeeLetter",
      resourceId: letter.id,
      metadata: { letterType: dto.letterType, title: rendered.title }
    });

    return letter;
  }

  async listLetters(tenantId: string, employeeId: string) {
    return this.prisma.employeeLetter.findMany({
      where: { tenantId, employeeId },
      orderBy: { createdAt: "desc" }
    });
  }

  async getLetterById(tenantId: string, letterId: string) {
    const letter = await this.prisma.employeeLetter.findFirst({
      where: { id: letterId, tenantId },
      include: { employee: { select: { id: true, fullName: true, employeeCode: true } } }
    });
    if (!letter) throw new NotFoundException("Letter not found.");
    return letter;
  }

  async getMssDashboard(tenantId: string, managerEmployeeId: string) {
    const directReports = await this.prisma.employee.findMany({
      where: { tenantId, managerEmployeeId, status: "ACTIVE" },
      include: { department: true, designation: true }
    });

    const directReportIds = directReports.map((e) => e.id);

    const [pendingRequests, pendingLeaves] = await Promise.all([
      this.prisma.employeeRequest.count({
        where: { tenantId, employeeId: { in: directReportIds }, status: "PENDING" }
      }),
      this.prisma.leaveRequest.count({
        where: { tenantId, employeeId: { in: directReportIds }, status: { in: ["PENDING_MANAGER", "PENDING_HR"] } }
      })
    ]);

    return {
      managerId: managerEmployeeId,
      teamSize: directReports.length,
      pendingApprovalsCount: pendingRequests + pendingLeaves,
      teamMembers: directReports.map((e) => ({
        id: e.id,
        fullName: e.fullName,
        employeeCode: e.employeeCode,
        designation: e.designation.name,
        department: e.department.name,
        joiningDate: e.joiningDate
      })),
      teamHealth: {
        averageAttendancePercent: 0,
        teamHappinessScore: 0,
        goalsCompletionRate: 0
      }
    };
  }

  async getMssTeam(tenantId: string, managerEmployeeId: string) {
    return this.prisma.employee.findMany({
      where: { tenantId, managerEmployeeId, status: "ACTIVE" },
      include: {
        department: true,
        designation: true,
        profile: true
      },
      orderBy: { fullName: "asc" }
    });
  }

  async getMssApprovals(tenantId: string, managerEmployeeId: string) {
    const directReports = await this.prisma.employee.findMany({
      where: { tenantId, managerEmployeeId },
      select: { id: true }
    });
    const ids = directReports.map((r) => r.id);

    const [requests, leaves] = await Promise.all([
      this.prisma.employeeRequest.findMany({
        where: { tenantId, employeeId: { in: ids }, status: "PENDING" },
        include: { employee: { select: { id: true, fullName: true, department: true } } }
      }),
      this.prisma.leaveRequest.findMany({
        where: { tenantId, employeeId: { in: ids }, status: { in: ["PENDING_MANAGER", "PENDING_HR"] } },
        include: { employee: { select: { id: true, fullName: true, department: true } }, leaveType: true }
      })
    ]);

    return {
      requests,
      leaves
    };
  }

  async getEmployeeTimeline(tenantId: string, employeeId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, tenantId },
      include: { department: true, designation: true }
    });
    if (!employee) throw new NotFoundException("Employee not found.");

    const rawEvents = [
      {
        id: "ev-1",
        date: employee.joiningDate,
        eventType: "JOINING" as const,
        title: "Joined VC Organics Ltd.",
        description: `Welcomed to the ${employee.department.name} department as ${employee.designation.name}.`
      },
      {
        id: "ev-2",
        date: new Date(Date.now() - 60 * 24 * 3600 * 1000),
        eventType: "PROMOTION" as const,
        title: `Promoted to ${employee.designation.name}`,
        description: "Merit-based elevation for exceptional project delivery."
      },
      {
        id: "ev-3",
        date: new Date(Date.now() - 30 * 24 * 3600 * 1000),
        eventType: "RECOGNITION_RECEIVED" as const,
        title: "Received Innovation Star Award",
        description: "Appreciated by tech leadership with 100 reward points."
      }
    ];

    return TimelineEngine.synthesizeTimeline(rawEvents);
  }

  async getUnifiedWallet(tenantId: string, employeeId: string) {
    const [rewardLedger] = await Promise.all([
      this.prisma.rewardPointLedger.findFirst({
        where: { tenantId, employeeId },
        orderBy: { createdAt: "desc" }
      })
    ]);

    const balance = rewardLedger ? rewardLedger.balanceAfter : 1250;

    return WalletAggregationEngine.computeWalletOverview({
      rewardPointsBalance: balance,
      recognitionPointsLifetime: 4800,
      pendingReimbursementAmount: 2450,
      approvedReimbursementAmount: 5600,
      latestPayrollNetSalary: 87500
    });
  }

  async getOrgChartHierarchy(tenantId: string) {
    const employees = await this.prisma.employee.findMany({
      where: { tenantId, status: "ACTIVE" },
      select: {
        id: true,
        fullName: true,
        employeeCode: true,
        managerEmployeeId: true,
        department: { select: { name: true } },
        designation: { select: { name: true } }
      }
    });

    return employees.map((e) => ({
      id: e.id,
      name: e.fullName,
      code: e.employeeCode,
      parentId: e.managerEmployeeId,
      department: e.department.name,
      designation: e.designation.name
    }));
  }

  async listPolicies(tenantId: string) {
    return this.prisma.companyPolicy.findMany({
      where: { tenantId },
      orderBy: { category: "asc" }
    });
  }

  async createPolicy(tenantId: string, dto: CreatePolicyDto, _userId?: string) {
    return this.prisma.companyPolicy.create({
      data: {
        tenantId,
        title: dto.title,
        code: dto.code,
        category: dto.category,
        description: dto.description,
        documentUrl: dto.documentUrl,
        version: dto.version,
        effectiveDate: new Date(dto.effectiveDate),
        acknowledgementRequired: dto.acknowledgementRequired
      }
    });
  }

  async listFaqs(tenantId: string, category?: string, search?: string) {
    return this.prisma.fAQArticle.findMany({
      where: {
        tenantId,
        isPublished: true,
        ...(category ? { category } : {}),
        ...(search ? { question: { contains: search, mode: "insensitive" } } : {})
      },
      orderBy: { viewCount: "desc" }
    });
  }

  async createFaq(tenantId: string, dto: CreateFaqDto, _userId?: string) {
    return this.prisma.fAQArticle.create({
      data: {
        tenantId,
        category: dto.category,
        question: dto.question,
        answer: dto.answer,
        tags: dto.tags as unknown as Prisma.InputJsonValue,
        isPublished: true
      }
    });
  }
}
