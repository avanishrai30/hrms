import {
  Injectable,
  NotFoundException
} from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { AuditService } from "../audit/audit.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import type {
  DirectoryFilterDto,
  UpdateProfileDto
} from "./ess.schemas.js";
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

    const employees = await this.prisma.employee.findMany({
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
      take: filter?.limit ?? 50,
      skip: filter?.offset ?? 0
    });

    const managerIds = Array.from(
      new Set(employees.map((e) => e.managerEmployeeId).filter((id): id is string => Boolean(id)))
    );

    const managers = await this.prisma.employee.findMany({
      where: { id: { in: managerIds } },
      select: { id: true, fullName: true }
    });

    const managerMap = new Map(managers.map((m) => [m.id, m.fullName]));

    return employees.map((e) => ({
      id: e.id,
      employeeCode: e.employeeCode,
      fullName: e.fullName,
      preferredName: e.preferredName,
      email: e.email,
      phone: e.phone,
      department: e.department.name,
      designation: e.designation.name,
      businessUnit: e.businessUnit?.name || "Corporate",
      team: e.team?.name || "Core Team",
      region: e.region?.name || "Headquarters",
      managerName: e.managerEmployeeId ? managerMap.get(e.managerEmployeeId) || null : null,
      joiningDate: e.joiningDate.toISOString(),
      profilePhoto: e.profile?.profilePhoto || e.profilePhotoObjectKey || null,
      status: e.status
    }));
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
}
