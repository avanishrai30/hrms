/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EssService } from "../src/modules/ess/ess.service.js";

describe("Organization Directory (Task 18)", () => {
  let essService: EssService;
  let mockPrisma: any;
  let mockAudit: any;

  const tenantId = "11111111-1111-1111-1111-111111111111";

  beforeEach(() => {
    mockPrisma = {
      employee: {
        findMany: vi.fn().mockImplementation(({ where }) => {
          const list = [
            {
              id: "emp-1",
              employeeCode: "EMP001",
              fullName: "Alice Smith",
              preferredName: "Alice",
              email: "alice@company.com",
              phone: "+919876543210",
              department: { name: "Engineering" },
              designation: { name: "Lead Architect" },
              businessUnit: { name: "Technology" },
              region: { name: "North" },
              team: { name: "Platform" },
              managerEmployeeId: null,
              joiningDate: new Date("2023-01-01"),
              status: "ACTIVE",
              profile: { profilePhoto: "photo1.jpg" },
              profilePhotoObjectKey: null
            },
            {
              id: "emp-2",
              employeeCode: "EMP002",
              fullName: "Bob Johnson",
              preferredName: "Bob",
              email: "bob@company.com",
              phone: "+919876543211",
              department: { name: "Engineering" },
              designation: { name: "Senior Developer" },
              businessUnit: { name: "Technology" },
              region: { name: "North" },
              team: { name: "Platform" },
              managerEmployeeId: "emp-1",
              joiningDate: new Date("2023-06-01"),
              status: "ACTIVE",
              profile: null,
              profilePhotoObjectKey: "photo2.jpg"
            }
          ];

          if (where?.OR) {
            return Promise.resolve([list[0]]);
          }
          return Promise.resolve(list);
        }),
        count: vi.fn().mockImplementation(({ where }) => {
          if (where?.OR) {
            return Promise.resolve(1);
          }
          return Promise.resolve(2);
        })
      }
    };

    mockAudit = {
      record: vi.fn().mockResolvedValue({ id: "audit-1" })
    };

    essService = new EssService(
      mockPrisma,
      mockAudit,
      {} as any,
      {} as any,
      {} as any
    );
  });

  it("searches organization directory and resolves reporting manager chains", async () => {
    const directory = await essService.getDirectory(tenantId, {});

    expect(directory.items).toHaveLength(2);
    expect(directory.total).toBe(2);
    expect(directory.items[0]!.fullName).toBe("Alice Smith");
    expect(directory.items[1]!.fullName).toBe("Bob Johnson");
    expect(directory.items[1]!.managerName).toBe("Alice Smith");
  });

  it("filters directory with search query", async () => {
    const results = await essService.getDirectory(tenantId, { search: "Alice" });

    expect(results.items).toHaveLength(1);
    expect(results.total).toBe(1);
    expect(results.items[0]!.fullName).toBe("Alice Smith");
  });
});
