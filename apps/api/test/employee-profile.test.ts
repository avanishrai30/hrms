/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EssService } from "../src/modules/ess/ess.service.js";

describe("Employee Profile Management (Task 18)", () => {
  let essService: EssService;
  let mockPrisma: any;
  let mockAudit: any;
  let mockVault: any;
  let mockRequests: any;
  let mockAnnounce: any;

  const tenantId = "11111111-1111-1111-1111-111111111111";
  const employeeId = "22222222-2222-2222-2222-222222222222";
  const userId = "33333333-3333-3333-3333-333333333333";

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue({ email: "emp@test.com" })
      },
      employee: {
        findFirst: vi.fn().mockResolvedValue({
          id: employeeId,
          tenantId,
          employeeCode: "EMP001",
          fullName: "John Doe",
          preferredName: "Johnny",
          email: "emp@test.com",
          personalEmail: "john@personal.com",
          phone: "+919876543210",
          departmentId: "dept-1",
          designationId: "desig-1",
          joiningDate: new Date("2024-01-15"),
          employmentType: "FULL_TIME",
          salaryType: "MONTHLY",
          status: "ACTIVE",
          department: { name: "Engineering" },
          designation: { name: "Senior Software Engineer" },
          businessUnit: { name: "Technology" },
          region: { name: "HQ" },
          team: { name: "Core" },
          profile: {
            id: "prof-1",
            bio: "Full stack engineer",
            bloodGroup: "O+",
            profilePhoto: "photos/emp-1.jpg",
            dateOfBirth: new Date("1995-05-10"),
            emergencyContactJson: { name: "Jane Doe", phone: "+919999999999", relationship: "Spouse" },
            addressJson: { line1: "123 Main St", city: "Bangalore", state: "Karnataka", postalCode: "560001", country: "India" }
          },
          createdAt: new Date("2024-01-15"),
          updatedAt: new Date("2024-01-15")
        }),
        update: vi.fn().mockResolvedValue({ id: employeeId })
      },
      employeeProfile: {
        upsert: vi.fn().mockResolvedValue({
          id: "prof-1",
          bio: "Updated Bio",
          bloodGroup: "O+",
          updatedAt: new Date()
        })
      }
    };

    mockAudit = {
      record: vi.fn().mockResolvedValue({ id: "audit-1" })
    };

    mockVault = {
      listDocuments: vi.fn().mockResolvedValue([])
    };
    mockRequests = {
      listRequests: vi.fn().mockResolvedValue([])
    };
    mockAnnounce = {
      listAnnouncements: vi.fn().mockResolvedValue([])
    };

    essService = new EssService(
      mockPrisma,
      mockAudit,
      mockVault,
      mockRequests,
      mockAnnounce
    );
  });

  it("retrieves full employee profile with computed completion score", async () => {
    const profile = await essService.getProfile(tenantId, employeeId, userId);

    expect(profile).toBeDefined();
    expect(profile.employeeCode).toBe("EMP001");
    expect(profile.fullName).toBe("John Doe");
    expect(profile.departmentName).toBe("Engineering");
    expect(profile.designationTitle).toBe("Senior Software Engineer");
    expect(profile.bloodGroup).toBe("O+");
    expect(profile.profileCompletionPercentage).toBeGreaterThan(50);
  });

  it("updates employee personal information and records audit log", async () => {
    const updateDto = {
      preferredName: "JD",
      personalEmail: "jd@personal.com",
      bio: "Lead architect & builder",
      bloodGroup: "O+" as const,
      emergencyContact: {
        name: "Jane Doe",
        relationship: "Spouse",
        phone: "+919876500000"
      }
    };

    await essService.updateProfile(tenantId, employeeId, updateDto, userId);

    expect(mockPrisma.employee.update).toHaveBeenCalled();
    expect(mockPrisma.employeeProfile.upsert).toHaveBeenCalled();
    expect(mockAudit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId,
        actorUserId: userId,
        action: "profile.updated",
        resourceType: "employee_profile"
      })
    );
  });
});
