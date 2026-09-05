import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res
} from "@nestjs/common";
import { type Response } from "express";
import { type AuthenticatedRequest } from "../common/request-context.js";
import { requireTenantContext } from "../common/tenant-context.js";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import { RequirePermissions } from "../rbac/permissions.decorator.js";
import {
  announcementFilterSchema,
  createAnnouncementSchema,
  createEmployeeRequestSchema,
  directoryFilterSchema,
  documentFilterSchema,
  requestFilterSchema,
  resolveEmployeeRequestSchema,
  updateProfileSchema,
  uploadAvatarSchema,
  uploadDocumentSchema,
  verifyDocumentSchema,
  generateLetterSchema,
  createPolicySchema,
  createFaqSchema,
  type AnnouncementFilterDto,
  type CreateAnnouncementDto,
  type CreateEmployeeRequestDto,
  type DirectoryFilterDto,
  type DocumentFilterDto,
  type RequestFilterDto,
  type ResolveEmployeeRequestDto,
  type UpdateProfileDto,
  type UploadAvatarDto,
  type UploadDocumentDto,
  type VerifyDocumentDto,
  type GenerateLetterDto,
  type CreatePolicyDto,
  type CreateFaqDto
} from "./ess.schemas.js";
import { EssService } from "./ess.service.js";
import { AnnouncementService } from "./services/announcement.service.js";
import { DocumentVaultService } from "./services/document-vault.service.js";
import { EmployeeRequestService } from "./services/employee-request.service.js";
import { IdCardService } from "./services/id-card.service.js";

@Controller()
export class EssController {
  constructor(
    private readonly essService: EssService,
    private readonly documentVaultService: DocumentVaultService,
    private readonly employeeRequestService: EmployeeRequestService,
    private readonly announcementService: AnnouncementService,
    private readonly idCardService: IdCardService
  ) {}

  // ----------------- Profile Endpoints -----------------

  @Get("profile")
  @RequirePermissions("profile.view")
  async getProfile(
    @Req() req: AuthenticatedRequest,
    @Query("employeeId") queryEmployeeId?: string
  ) {
    const tenant = requireTenantContext(req);
    const targetEmployeeId =
      queryEmployeeId || (await this.essService.resolveEmployeeIdForUser(tenant.tenantId, tenant.userId));

    return this.essService.getProfile(tenant.tenantId, targetEmployeeId, tenant.userId);
  }

  @Put("profile")
  @RequirePermissions("profile.update")
  async updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(updateProfileSchema)) body: UpdateProfileDto,
    @Query("employeeId") queryEmployeeId?: string
  ) {
    const tenant = requireTenantContext(req);
    const targetEmployeeId =
      queryEmployeeId || (await this.essService.resolveEmployeeIdForUser(tenant.tenantId, tenant.userId));

    return this.essService.updateProfile(tenant.tenantId, targetEmployeeId, body, tenant.userId);
  }

  @Post("profile/avatar")
  @RequirePermissions("profile.update")
  async uploadAvatar(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(uploadAvatarSchema)) body: UploadAvatarDto,
    @Query("employeeId") queryEmployeeId?: string
  ) {
    const tenant = requireTenantContext(req);
    const targetEmployeeId =
      queryEmployeeId || (await this.essService.resolveEmployeeIdForUser(tenant.tenantId, tenant.userId));

    return this.essService.uploadAvatar(tenant.tenantId, targetEmployeeId, body, tenant.userId);
  }

  @Delete("profile/avatar")
  @RequirePermissions("profile.update")
  async removeAvatar(
    @Req() req: AuthenticatedRequest,
    @Query("employeeId") queryEmployeeId?: string
  ) {
    const tenant = requireTenantContext(req);
    const targetEmployeeId =
      queryEmployeeId || (await this.essService.resolveEmployeeIdForUser(tenant.tenantId, tenant.userId));

    return this.essService.removeAvatar(tenant.tenantId, targetEmployeeId, tenant.userId);
  }

  // ----------------- Document Vault Endpoints -----------------

  @Get("documents")
  @RequirePermissions("documents.view")
  async listDocuments(
    @Req() req: AuthenticatedRequest,
    @Query(new ZodValidationPipe(documentFilterSchema)) filter: DocumentFilterDto
  ) {
    const tenant = requireTenantContext(req);
    let targetEmployeeId = filter.employeeId;

    if (!targetEmployeeId && !tenant.roles.some((r) => ["TENANT_OWNER", "TENANT_ADMIN", "HR_ADMIN"].includes(r))) {
      targetEmployeeId = await this.essService.resolveEmployeeIdForUser(tenant.tenantId, tenant.userId);
    }

    return this.documentVaultService.listDocuments(tenant.tenantId, targetEmployeeId, filter);
  }

  @Post("documents")
  @RequirePermissions("documents.upload")
  async uploadDocument(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(uploadDocumentSchema)) body: UploadDocumentDto
  ) {
    const tenant = requireTenantContext(req);
    const targetEmployeeId =
      body.employeeId || (await this.essService.resolveEmployeeIdForUser(tenant.tenantId, tenant.userId));

    return this.documentVaultService.uploadDocument(
      tenant.tenantId,
      targetEmployeeId,
      body,
      undefined,
      tenant.userId
    );
  }

  @Get("documents/:id")
  @RequirePermissions("documents.view")
  async getDocument(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string
  ) {
    const tenant = requireTenantContext(req);
    return this.documentVaultService.getDocument(tenant.tenantId, id, tenant.userId);
  }

  @Get("documents/:id/download")
  @RequirePermissions("documents.view")
  async downloadDocument(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string
  ) {
    const tenant = requireTenantContext(req);
    const doc = await this.documentVaultService.getDocument(tenant.tenantId, id, tenant.userId);
    return {
      downloadUrl: doc.downloadUrl,
      fileName: doc.fileName,
      mimeType: doc.mimeType
    };
  }

  @Patch("documents/:id/verify")
  @RequirePermissions("documents.verify")
  async verifyDocument(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(verifyDocumentSchema)) body: VerifyDocumentDto
  ) {
    const tenant = requireTenantContext(req);
    return this.documentVaultService.verifyDocument(tenant.tenantId, id, tenant.userId, body);
  }

  @Delete("documents/:id")
  @RequirePermissions("documents.upload")
  async deleteDocument(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string
  ) {
    const tenant = requireTenantContext(req);
    return this.documentVaultService.deleteDocument(tenant.tenantId, id, tenant.userId);
  }

  // ----------------- Employee Request Endpoints -----------------

  @Get("requests")
  @RequirePermissions("requests.view")
  async listRequests(
    @Req() req: AuthenticatedRequest,
    @Query(new ZodValidationPipe(requestFilterSchema)) filter: RequestFilterDto
  ) {
    const tenant = requireTenantContext(req);
    let targetEmployeeId = filter.employeeId;

    if (!targetEmployeeId && !tenant.roles.some((r) => ["TENANT_OWNER", "TENANT_ADMIN", "HR_ADMIN", "MANAGER"].includes(r))) {
      targetEmployeeId = await this.essService.resolveEmployeeIdForUser(tenant.tenantId, tenant.userId);
    }

    return this.employeeRequestService.listRequests(tenant.tenantId, targetEmployeeId, filter);
  }

  @Post("requests")
  @RequirePermissions("requests.create")
  async submitRequest(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(createEmployeeRequestSchema)) body: CreateEmployeeRequestDto
  ) {
    const tenant = requireTenantContext(req);
    const targetEmployeeId =
      body.employeeId || (await this.essService.resolveEmployeeIdForUser(tenant.tenantId, tenant.userId));

    return this.employeeRequestService.submitRequest(tenant.tenantId, targetEmployeeId, body, tenant.userId);
  }

  @Get("requests/:id")
  @RequirePermissions("requests.view")
  async getRequest(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string
  ) {
    const tenant = requireTenantContext(req);
    return this.employeeRequestService.getRequest(tenant.tenantId, id);
  }

  @Post("requests/:id/approve")
  @RequirePermissions("requests.manage")
  async approveRequest(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(resolveEmployeeRequestSchema)) body: ResolveEmployeeRequestDto
  ) {
    const tenant = requireTenantContext(req);
    return this.employeeRequestService.approveRequest(tenant.tenantId, id, tenant.userId, body);
  }

  @Post("requests/:id/reject")
  @RequirePermissions("requests.manage")
  async rejectRequest(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(resolveEmployeeRequestSchema)) body: ResolveEmployeeRequestDto
  ) {
    const tenant = requireTenantContext(req);
    return this.employeeRequestService.rejectRequest(tenant.tenantId, id, tenant.userId, body);
  }

  @Post("requests/:id/cancel")
  @RequirePermissions("requests.create")
  async cancelRequest(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string
  ) {
    const tenant = requireTenantContext(req);
    const employeeId = await this.essService.resolveEmployeeIdForUser(tenant.tenantId, tenant.userId);
    return this.employeeRequestService.cancelRequest(tenant.tenantId, id, employeeId);
  }

  // ----------------- Announcement Endpoints -----------------

  @Get("announcements")
  @RequirePermissions("announcements.view")
  async listAnnouncements(
    @Req() req: AuthenticatedRequest,
    @Query(new ZodValidationPipe(announcementFilterSchema)) filter: AnnouncementFilterDto
  ) {
    const tenant = requireTenantContext(req);
    let employeeId: string | undefined;
    try {
      employeeId = await this.essService.resolveEmployeeIdForUser(tenant.tenantId, tenant.userId);
    } catch {
      // Ignored for platform admins without employee profile
    }

    return this.announcementService.listAnnouncements(tenant.tenantId, employeeId, filter);
  }

  @Post("announcements")
  @RequirePermissions("announcements.manage")
  async createAnnouncement(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(createAnnouncementSchema)) body: CreateAnnouncementDto
  ) {
    const tenant = requireTenantContext(req);
    return this.announcementService.createAnnouncement(tenant.tenantId, body, tenant.userId);
  }

  @Get("announcements/:id")
  @RequirePermissions("announcements.view")
  async getAnnouncement(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string
  ) {
    const tenant = requireTenantContext(req);
    let employeeId: string | undefined;
    try {
      employeeId = await this.essService.resolveEmployeeIdForUser(tenant.tenantId, tenant.userId);
    } catch {
      // Ignore
    }
    return this.announcementService.getAnnouncement(tenant.tenantId, id, employeeId);
  }

  @Post("announcements/:id/acknowledge")
  @RequirePermissions("announcements.acknowledge")
  async acknowledgeAnnouncement(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string
  ) {
    const tenant = requireTenantContext(req);
    const employeeId = await this.essService.resolveEmployeeIdForUser(tenant.tenantId, tenant.userId);
    return this.announcementService.acknowledgeAnnouncement(tenant.tenantId, id, employeeId);
  }

  @Delete("announcements/:id")
  @RequirePermissions("announcements.manage")
  async deleteAnnouncement(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string
  ) {
    const tenant = requireTenantContext(req);
    return this.announcementService.deleteAnnouncement(tenant.tenantId, id, tenant.userId);
  }

  // ----------------- Organization Directory Endpoints -----------------

  @Get("directory")
  @RequirePermissions("directory.view")
  async getDirectory(
    @Req() req: AuthenticatedRequest,
    @Query(new ZodValidationPipe(directoryFilterSchema)) filter: DirectoryFilterDto
  ) {
    const tenant = requireTenantContext(req);
    return this.essService.getDirectory(tenant.tenantId, filter);
  }

  // ----------------- Digital ID Card Endpoints -----------------

  @Get("id-card")
  @RequirePermissions("idcard.view")
  async getIdCard(
    @Req() req: AuthenticatedRequest,
    @Query("employeeId") queryEmployeeId?: string
  ) {
    const tenant = requireTenantContext(req);
    const targetEmployeeId =
      queryEmployeeId || (await this.essService.resolveEmployeeIdForUser(tenant.tenantId, tenant.userId));

    return this.idCardService.getIdCardData(tenant.tenantId, targetEmployeeId);
  }

  @Get("id-card/download")
  @RequirePermissions("idcard.view")
  @Header("Content-Type", "application/pdf")
  async downloadIdCardPdf(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
    @Query("employeeId") queryEmployeeId?: string
  ) {
    const tenant = requireTenantContext(req);
    const targetEmployeeId =
      queryEmployeeId || (await this.essService.resolveEmployeeIdForUser(tenant.tenantId, tenant.userId));

    const { buffer, filename } = await this.idCardService.generateIdCardPdf(tenant.tenantId, targetEmployeeId);

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.end(buffer);
  }

  // ----------------- ESS Dashboard & Digital Workplace Endpoints -----------------

  @Get("ess/dashboard")
  @RequirePermissions("profile.view")
  async getEssDashboard(
    @Req() req: AuthenticatedRequest,
    @Query("employeeId") queryEmployeeId?: string
  ) {
    const tenant = requireTenantContext(req);
    const targetEmployeeId =
      queryEmployeeId || (await this.essService.resolveEmployeeIdForUser(tenant.tenantId, tenant.userId));

    return this.essService.getEssDashboard(tenant.tenantId, targetEmployeeId);
  }

  @Get("ess/quick-actions")
  @RequirePermissions("profile.view")
  async getQuickActions(
    @Req() req: AuthenticatedRequest,
    @Query("employeeId") queryEmployeeId?: string
  ) {
    const tenant = requireTenantContext(req);
    const targetEmployeeId =
      queryEmployeeId || (await this.essService.resolveEmployeeIdForUser(tenant.tenantId, tenant.userId));

    return this.essService.getQuickActions(tenant.tenantId, targetEmployeeId);
  }

  // ----------------- Letters Generator Endpoints -----------------

  @Post("letters/generate")
  @RequirePermissions("letters.generate")
  async generateLetter(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(generateLetterSchema)) body: GenerateLetterDto
  ) {
    const tenant = requireTenantContext(req);
    const targetEmployeeId =
      body.employeeId || (await this.essService.resolveEmployeeIdForUser(tenant.tenantId, tenant.userId));

    return this.essService.generateLetter(
      tenant.tenantId,
      targetEmployeeId,
      body,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Get("letters")
  @RequirePermissions("profile.view")
  async listLetters(
    @Req() req: AuthenticatedRequest,
    @Query("employeeId") queryEmployeeId?: string
  ) {
    const tenant = requireTenantContext(req);
    const targetEmployeeId =
      queryEmployeeId || (await this.essService.resolveEmployeeIdForUser(tenant.tenantId, tenant.userId));

    return this.essService.listLetters(tenant.tenantId, targetEmployeeId);
  }

  @Get("letters/:id")
  @RequirePermissions("profile.view")
  async getLetterById(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string
  ) {
    const tenant = requireTenantContext(req);
    return this.essService.getLetterById(tenant.tenantId, id);
  }

  // ----------------- MSS Manager Self Service Endpoints -----------------

  @Get("mss/dashboard")
  @RequirePermissions("mss.read")
  async getMssDashboard(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    const managerEmployeeId = await this.essService.resolveEmployeeIdForUser(tenant.tenantId, tenant.userId);
    return this.essService.getMssDashboard(tenant.tenantId, managerEmployeeId);
  }

  @Get("mss/team")
  @RequirePermissions("mss.read")
  async getMssTeam(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    const managerEmployeeId = await this.essService.resolveEmployeeIdForUser(tenant.tenantId, tenant.userId);
    return this.essService.getMssTeam(tenant.tenantId, managerEmployeeId);
  }

  @Get("mss/approvals")
  @RequirePermissions("mss.read")
  async getMssApprovals(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    const managerEmployeeId = await this.essService.resolveEmployeeIdForUser(tenant.tenantId, tenant.userId);
    return this.essService.getMssApprovals(tenant.tenantId, managerEmployeeId);
  }

  // ----------------- Org Chart & Directory Endpoints -----------------

  @Get("directory/org-chart")
  @RequirePermissions("directory.view")
  async getOrgChart(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.essService.getOrgChartHierarchy(tenant.tenantId);
  }

  // ----------------- Wallet & Timeline Endpoints -----------------

  @Get("wallet")
  @RequirePermissions("profile.view")
  async getWallet(
    @Req() req: AuthenticatedRequest,
    @Query("employeeId") queryEmployeeId?: string
  ) {
    const tenant = requireTenantContext(req);
    const targetEmployeeId =
      queryEmployeeId || (await this.essService.resolveEmployeeIdForUser(tenant.tenantId, tenant.userId));

    return this.essService.getUnifiedWallet(tenant.tenantId, targetEmployeeId);
  }

  @Get("employee-timeline")
  @RequirePermissions("profile.view")
  async getEmployeeTimeline(
    @Req() req: AuthenticatedRequest,
    @Query("employeeId") queryEmployeeId?: string
  ) {
    const tenant = requireTenantContext(req);
    const targetEmployeeId =
      queryEmployeeId || (await this.essService.resolveEmployeeIdForUser(tenant.tenantId, tenant.userId));

    return this.essService.getEmployeeTimeline(tenant.tenantId, targetEmployeeId);
  }

  // ----------------- Policies & FAQs Endpoints -----------------

  @Get("policies")
  @RequirePermissions("profile.view")
  async listPolicies(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.essService.listPolicies(tenant.tenantId);
  }

  @Post("policies")
  @RequirePermissions("communications.manage")
  async createPolicy(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(createPolicySchema)) body: CreatePolicyDto
  ) {
    const tenant = requireTenantContext(req);
    return this.essService.createPolicy(tenant.tenantId, body, tenant.userId);
  }

  @Get("faqs")
  @RequirePermissions("profile.view")
  async listFaqs(
    @Req() req: AuthenticatedRequest,
    @Query("category") category?: string,
    @Query("search") search?: string
  ) {
    const tenant = requireTenantContext(req);
    return this.essService.listFaqs(tenant.tenantId, category, search);
  }

  @Post("faqs")
  @RequirePermissions("communications.manage")
  async createFaq(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(createFaqSchema)) body: CreateFaqDto
  ) {
    const tenant = requireTenantContext(req);
    return this.essService.createFaq(tenant.tenantId, body, tenant.userId);
  }
}
