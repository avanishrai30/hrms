import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { AuditService } from "../../audit/audit.service.js";
import { EmploymentStatus, SalaryType } from "@prisma/client";

export interface OnboardCandidateOptions {
  employeeCode?: string;
  joiningDate?: string;
  salaryType?: SalaryType;
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
    return await this.prisma.$transaction(async (tx) => {
      const candidate = await tx.candidate.findFirst({
        where: { id: candidateId, tenantId },
        include: {
          applications: {
            include: {
              requisition: true,
              offers: {
                where: { status: "ACCEPTED", tenantId, candidateId },
                orderBy: { createdAt: "desc" }
              }
            }
          }
        }
      });

      if (!candidate) {
        throw new NotFoundException("Candidate not found.");
      }

      if (candidate.hiredEmployeeId) {
        throw new BadRequestException("Candidate is already onboarded as an employee.");
      }

      const acceptedApplication = candidate.applications.find((application) =>
        application.offers.some(
          (offer) =>
            offer.tenantId === tenantId &&
            offer.candidateId === candidate.id &&
            offer.applicationId === application.id &&
            offer.requisitionId === application.requisitionId
        )
      );
      const acceptedOffer = acceptedApplication?.offers.find(
        (offer) =>
          offer.tenantId === tenantId &&
          offer.candidateId === candidate.id &&
          offer.applicationId === acceptedApplication.id &&
          offer.requisitionId === acceptedApplication.requisitionId
      );
      const requisition = acceptedApplication?.requisition;

      if (!acceptedOffer) {
        throw new BadRequestException("Candidate cannot be onboarded without an accepted offer.");
      }

      if (!requisition) {
        throw new BadRequestException("Accepted offer must be linked to a valid job requisition.");
      }

      if (!requisition.employmentType) {
        throw new BadRequestException("Job requisition employment type is required before onboarding.");
      }

      const employeeCode = options.employeeCode?.trim();
      if (!employeeCode) {
        throw new BadRequestException("Employee code is required for candidate onboarding.");
      }

      if (!options.salaryType) {
        throw new BadRequestException("Salary type is required for candidate onboarding.");
      }

      if (options.salaryTemplateId) {
        throw new BadRequestException("Compensation setup must be completed through the compensation workflow.");
      }

      const joiningDate = resolveJoiningDate(options.joiningDate, acceptedOffer.joiningDate);

      const existing = await tx.employee.findFirst({
        where: { tenantId, OR: [{ employeeCode }, { email: candidate.email }] }
      });
      if (existing) {
        throw new BadRequestException(`Employee with code ${employeeCode} or email ${candidate.email} already exists.`);
      }

      const employeeRole = await tx.role.findFirst({
        where: { tenantId, code: "EMPLOYEE" }
      });
      if (!employeeRole) {
        throw new BadRequestException("Tenant EMPLOYEE role is required before candidate onboarding.");
      }

      const employee = await tx.employee.create({
        data: {
          tenantId,
          employeeCode,
          fullName: candidate.fullName,
          email: candidate.email,
          phone: candidate.mobile,
          departmentId: requisition.departmentId,
          designationId: requisition.designationId,
          employmentType: requisition.employmentType,
          salaryType: options.salaryType,
          status: EmploymentStatus.DRAFT,
          joiningDate
        }
      });

      const existingMembership = await tx.tenantMembership.findFirst({
        where: {
          tenantId,
          user: { email: candidate.email }
        },
        include: { user: true }
      });

      if (existingMembership?.employeeId && existingMembership.employeeId !== employee.id) {
        throw new BadRequestException("Tenant user membership is already linked to another employee.");
      }

      const user =
        existingMembership?.user ??
        (await tx.user.create({
          data: {
            email: candidate.email,
            phone: candidate.mobile,
            status: "INVITED"
          }
        }));

      const membership = existingMembership
        ? await tx.tenantMembership.update({
            where: { id: existingMembership.id },
            data: { employeeId: employee.id }
          })
        : await tx.tenantMembership.create({
            data: {
              tenantId,
              userId: user.id,
              employeeId: employee.id,
              status: "INVITED"
            }
          });

      await tx.tenantMembershipRole.upsert({
        where: {
          tenantId_membershipId_roleId: {
            tenantId,
            membershipId: membership.id,
            roleId: employeeRole.id
          }
        },
        create: {
          tenantId,
          membershipId: membership.id,
          roleId: employeeRole.id
        },
        update: {}
      });

      await tx.employeeProfile.create({
        data: {
          tenantId,
          employeeId: employee.id,
          bio: candidate.summary || null,
          addressJson: candidate.currentLocation ? { city: candidate.currentLocation } : undefined
        }
      });

      await tx.candidate.update({
        where: { id: candidateId },
        data: {
          status: "HIRED",
          hiredEmployeeId: employee.id
        }
      });

      const actor = actorUserId
        ? await tx.user.findUnique({ where: { id: actorUserId }, select: { email: true } })
        : null;
      const actorName = actor?.email ?? (actorUserId ? `User ${actorUserId}` : "System");

      await tx.candidateActivity.create({
        data: {
          tenantId,
          candidateId,
          actorName,
          activityType: "CANDIDATE_ONBOARDED",
          title: "Candidate Converted to Employee Draft",
          description: `Created draft employee ${employee.employeeCode} (${employee.fullName}) from accepted offer ${acceptedOffer.offerCode}. Tenant membership remains invited until activation.`,
          metadataJson: {
            employeeId: employee.id,
            employeeCode: employee.employeeCode,
            offerId: acceptedOffer.id,
            applicationId: acceptedOffer.applicationId,
            requisitionId: acceptedOffer.requisitionId
          }
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

function resolveJoiningDate(explicitJoiningDate: string | undefined, offerJoiningDate: Date): Date {
  const source = explicitJoiningDate ?? offerJoiningDate;
  const joiningDate = source instanceof Date ? new Date(source.getTime()) : new Date(source);

  if (Number.isNaN(joiningDate.getTime())) {
    throw new BadRequestException("Candidate onboarding requires a valid joining date.");
  }

  return joiningDate;
}
