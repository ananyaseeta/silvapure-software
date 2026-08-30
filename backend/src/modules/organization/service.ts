import type { OrganizationStatus } from '@prisma/client';
import type { OrganizationRepository } from './repository';
import type {
  OrganizationRecord,
  OrganizationSummary,
  IndustryTypeRecord,
  CreateOrganizationDto,
  UpdateOrganizationDto,
  UpdateOrganizationStatusDto,
  PaginationParams,
  PaginatedResult,
} from './types';
import { OrganizationError, OrganizationErrorCode } from './types';
import type { OrgScopeService } from './scope.service';

export class OrganizationService {
  constructor(
    private readonly repo:      OrganizationRepository,
    private readonly scopeSvc?: OrgScopeService,
  ) {}

  async listIndustryTypes(): Promise<IndustryTypeRecord[]> {
    return this.repo.findAllIndustryTypes();
  }

  /**
   * Lists organizations.
   *
   * When a requesterId is supplied the list is scoped:
   *   - ADMIN users see all organizations.
   *   - All other users see only their own organization.
   *
   * When requesterId is omitted (internal/seed use) no scoping is applied.
   */
  async list(
    pagination:    PaginationParams,
    filters?:      { status?: OrganizationStatus; industryTypeId?: string },
    requesterId?:  string,
    requesterOrgId?: string,
  ): Promise<PaginatedResult<OrganizationSummary>> {
    if (requesterId && requesterOrgId && this.scopeSvc) {
      const isAdmin = await this.scopeSvc.isAdmin(requesterId);
      if (!isAdmin) {
        return this.repo.findAll(pagination, filters, requesterOrgId);
      }
    }
    return this.repo.findAll(pagination, filters);
  }

  async getById(id: string): Promise<OrganizationRecord> {
    const org = await this.repo.findById(id);
    if (!org) throw new OrganizationError(OrganizationErrorCode.NOT_FOUND, `Organization not found: ${id}`, 404);
    return org;
  }

  async create(dto: CreateOrganizationDto): Promise<OrganizationRecord> {
    const existing = await this.repo.findByCode(dto.organizationCode);
    if (existing) throw new OrganizationError(OrganizationErrorCode.CODE_TAKEN, `Organization code already in use: ${dto.organizationCode}`, 409);

    const industry = await this.repo.findIndustryTypeById(dto.industryTypeId);
    if (!industry) throw new OrganizationError(OrganizationErrorCode.INDUSTRY_NOT_FOUND, `Industry type not found: ${dto.industryTypeId}`, 422);

    return this.repo.create(dto);
  }

  async update(id: string, dto: UpdateOrganizationDto): Promise<OrganizationRecord> {
    await this.getById(id);
    return this.repo.update(id, dto);
  }

  async updateStatus(id: string, dto: UpdateOrganizationStatusDto): Promise<OrganizationRecord> {
    await this.getById(id);
    return this.repo.updateStatus(id, dto.status);
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    const userCount = await this.repo.countUsers(id);
    if (userCount > 0) {
      throw new OrganizationError(
        OrganizationErrorCode.CANNOT_DELETE_ACTIVE,
        `Cannot delete organization with ${userCount} active user(s). Deactivate the organization instead.`,
        409,
      );
    }
    await this.repo.delete(id);
  }
}
