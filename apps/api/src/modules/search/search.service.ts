import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { GlobalSearchEngine, type SearchResultItem } from "./engines/global-search.engine.js";

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(tenantId: string, query: string, category?: string): Promise<SearchResultItem[]> {
    if (!query || !query.trim()) return [];

    const [
      employees,
      vendors,
      contractors,
      assets,
      policies,
      faqs
    ] = await Promise.all([
      this.prisma.employee.findMany({
        where: { tenantId, status: "ACTIVE" },
        include: { department: true, designation: true },
        take: 100
      }),
      this.prisma.vendor.findMany({
        where: { tenantId, isActive: true },
        take: 50
      }),
      this.prisma.contractor.findMany({
        where: { tenantId, status: "ACTIVE" },
        take: 50
      }),
      this.prisma.asset.findMany({
        where: { tenantId },
        take: 50
      }),
      this.prisma.companyPolicy.findMany({
        where: { tenantId },
        take: 50
      }),
      this.prisma.fAQArticle.findMany({
        where: { tenantId, isPublished: true },
        take: 50
      })
    ]);

    const dataset: Array<{
      id: string;
      category: "EMPLOYEES" | "VENDORS" | "CONTRACTORS" | "ASSETS" | "POLICIES" | "KNOWLEDGE" | "DOCUMENTS";
      title: string;
      subtitle?: string;
      keywords?: string[];
      url: string;
    }> = [
      ...employees.map((e) => ({
        id: e.id,
        category: "EMPLOYEES" as const,
        title: e.fullName,
        subtitle: `${e.designation.name} • ${e.department.name} (${e.employeeCode})`,
        keywords: [e.employeeCode, e.email, e.department.name, e.designation.name],
        url: `/directory`
      })),
      ...vendors.map((v) => ({
        id: v.id,
        category: "VENDORS" as const,
        title: v.name,
        subtitle: `Vendor Code: ${v.code}${v.gstin ? ` • GSTIN: ${v.gstin}` : ""}`,
        keywords: [v.code, v.pan || "", v.gstin || ""],
        url: `/vendors`
      })),
      ...contractors.map((c) => ({
        id: c.id,
        category: "CONTRACTORS" as const,
        title: c.companyName,
        subtitle: `Code: ${c.contractCode} • Contact: ${c.contactPerson}`,
        keywords: [c.contractCode, c.companyName, c.contactPerson, c.phone],
        url: `/contractors`
      })),
      ...assets.map((a) => ({
        id: a.id,
        category: "ASSETS" as const,
        title: a.name,
        subtitle: `Code: ${a.assetCode} • ${a.category} (${a.status})`,
        keywords: [a.assetCode, a.serialNumber || "", a.category],
        url: `/assets`
      })),
      ...policies.map((p) => ({
        id: p.id,
        category: "POLICIES" as const,
        title: p.title,
        subtitle: `Policy Code: ${p.code} • Category: ${p.category}`,
        keywords: [p.code, p.category, p.description],
        url: `/communications/policies`
      })),
      ...faqs.map((f) => ({
        id: f.id,
        category: "KNOWLEDGE" as const,
        title: f.question,
        subtitle: `Category: ${f.category}`,
        keywords: [f.category, f.answer],
        url: `/knowledge`
      }))
    ];

    return GlobalSearchEngine.search(query, dataset, { category, limit: 25 });
  }
}
