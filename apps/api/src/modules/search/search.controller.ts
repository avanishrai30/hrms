import { Controller, Get, Query, Req } from "@nestjs/common";
import { type AuthenticatedRequest } from "../common/request-context.js";
import { requireTenantContext } from "../common/tenant-context.js";
import { RequirePermissions } from "../rbac/permissions.decorator.js";
import { SearchService } from "./search.service.js";

@Controller("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @RequirePermissions("search.global")
  async search(
    @Req() req: AuthenticatedRequest,
    @Query("q") q?: string,
    @Query("category") category?: string
  ) {
    const tenant = requireTenantContext(req);
    const results = await this.searchService.search(tenant.tenantId, q || "", category);
    return {
      query: q || "",
      category: category || "ALL",
      totalResults: results.length,
      results
    };
  }
}
