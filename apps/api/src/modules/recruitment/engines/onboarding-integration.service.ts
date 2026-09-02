import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { AuditService } from "../../audit/audit.service.js";
import { EmploymentStatus, EmploymentType, SalaryType } from "@prisma/client";

export interface OnboardCandidateOptions {
  employeeCode?: string;
  joiningDate?: string;
  salaryTemplateId?: string;
}

@Injectable()
export class OnboardingIntegrationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService
  ) {}

  async onboardHiredCandidate(
    tenantId: string,
    candidateId: string,
    options: OnboardCandidateOptions,
    actorUserId?: string,
    actorMembershipId?: string
  ) {
    const candidate = await this.prisma.candidate.findFirst({
      where: { id: candidateId, tenantId },
      include: {
        applications: {
          include: {
            requisition: true,
            offers: {
              where: { status: "ACCEPTED" },
              orderBy: { createdAt: "desc" },
              take: 1
            }
          }
        },
        offers: {
          where: { status: "ACCEPTED" },
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });

    if (!candidate) {
      throw new NotFoundException("Candidate not found.");
    }

    if (candidate.hiredEmployeeId) {
      throw new BadRequestException("Candidate is already onboarded as an employee.");
    }

    // Determine accepted offer & requisition
    const acceptedOffer = candidate.offers[0] || candidate.applications[0]?.offers[0];
    const requisition = candidate.applications[0]?.requisition;

    if (!requisition) {
      throw new BadRequestException("Candidate has no associated job requisition.");
    }

    const employeeCode =
      options.employeeCode?.trim() || `EMP-${Date.now().toString().slice(-4)}`;
    const joiningDate = options.joiningDate
      ? new Date(options.joiningDate)
      : acceptedOffer?.joiningDate
      ? new Date(acceptedOffer.joiningDate)
      : new Date();

    return await this.prisma.$transaction(async (tx) => {
      // 1. Check employee uniqueness
      const existing = await tx.employee.findFirst({
        where: { tenantId, OR: [{ employeeCode }, { email: candidate.email }] }
      });
      if (existing) {
        throw new BadRequestException(`Employee with code ${employeeCode} or email ${candidate.email} already exists.`);
      }

      // 2. Create Employee record
      const employee = await tx.employee.create({
        data: {
          tenantId,
          employeeCode,
          fullName: candidate.fullName,
          email: candidate.email,
          phone: candidate.mobile,
          departmentId: requisition.departmentId,
          designationId: requisition.designationId,
          employmentType: requisition.employmentType || EmploymentType.FULL_TIME,
          salaryType: SalaryType.MONTHLY,
          status: EmploymentStatus.ACTIVE,
          joiningDate,
          activatedAt: new Date()
        }
      });

      // 3. Create or Link User & Membership for ESS
      let user = await tx.user.findFirst({
        where: { email: candidate.email }
      });
      if (!user) {
        user = await tx.user.create({
          data: {
            email: candidate.email,
            phone: candidate.mobile,
            status: "ACTIVE"
          }
        });
      }

      // Find or create default employee role
      let employeeRole = await tx.role.findFirst({
        where: { tenantId, code: "EMPLOYEE" }
      });
      if (!employeeRole) {
        employeeRole = await tx.role.findFirst({
          where: { tenantId }
        });
      }

      const membership = await tx.tenantMembership.create({
        data: {
          tenantId,
          userId: user.id,
          employeeId: employee.id,
          status: "ACTIVE"
        }
      });

      if (employeeRole) {
        await tx.tenantMembershipRole.create({
          data: {
            tenantId,
            membershipId: membership.id,
            roleId: employeeRole.id
          }
        });
      }

      // 4. Create EmployeeProfile (Task 18 ESS)
      await tx.employeeProfile.create({
        data: {
          tenantId,
          employeeId: employee.id,
          bio: candidate.summary || null,
          addressJson: candidate.currentLocation ? { city: candidate.currentLocation } : undefined
        }
      });

      // 5. Seed default leave balances
      const leaveTypes = await tx.leaveType.findMany({
        where: { tenantId }
      });
      const currentYear = new Date().getFullYear();
      for (const lt of leaveTypes) {
        await tx.leaveBalance.create({
          data: {
            tenantId,
            employeeId: employee.id,
            leaveTypeId: lt.id,
            year: currentYear,
            allocatedDays: 12.0,
            accruedDays: 12.0,
            usedDays: 0.0,
            pendingDays: 0.0
          }
        });
      }

      // 6. Seed Compensation record if offer exists
      if (acceptedOffer) {
        await tx.employeeCompensation.create({
          data: {
            tenantId,
            employeeId: employee.id,
            monthlyCtc: Number(acceptedOffer.baseSalary),
            annualCtc: Number(acceptedOffer.totalCtc),
            currency: "INR",
            effectiveFrom: joiningDate,
            notes: `Auto-generated from accepted offer ${acceptedOffer.offerCode}`
          }
        });
      }

      // 7. Update Candidate status to HIRED & link employee ID
      await tx.candidate.update({
        where: { id: candidateId },
        data: {
          status: "HIRED",
          hiredEmployeeId: employee.id
        }
      });

      // 8. Record Timeline & Audit
      await tx.candidateActivity.create({
        data: {
          tenantId,
          candidateId,
          actorName: "System Onboarding Engine",
          activityType: "CANDIDATE_ONBOARDED",
          title: "Candidate Onboarded as Active Employee",
          description: `Generated Employee ID ${employee.employeeCode} (${employee.fullName}) and provisioned ESS workspace account.`,
          metadataJson: { employeeId: employee.id, employeeCode: employee.employeeCode }
        }
      });

      await this.auditService.record({
        tenantId,
        actorUserId,
        actorMembershipId,
        action: "candidate.onboarded",
        resourceType: "candidate",
        resourceId: candidate.id,
        after: {
          employeeId: employee.id,
          employeeCode: employee.employeeCode,
          email: employee.email,
          joiningDate: employee.joiningDate
        }
      });

      return {
        success: true,
        candidateId: candidate.id,
        employeeId: employee.id,
        employeeCode: employee.employeeCode,
        fullName: employee.fullName,
        email: employee.email,
        joiningDate: employee.joiningDate
      };
    });
  }
}
