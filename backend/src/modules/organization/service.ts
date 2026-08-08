/**
 * Organization Service
 *
 * All organization business logic lives here.
 * The service is unaware of HTTP — it receives plain DTOs and returns domain
 * objects. The controller owns request/response handling.
 *
 * Business rules enforced:
 *   - organizationCode must be globally unique (checked before insert).
 *   - industryTypeId must reference an existing IndustryType row.
 *   - An ACTIVE organization with users cannot be hard-deleted.
 */

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
import {
  OrganizationError,
  OrganizationErrorCode,
} from './types';

export class OrganizationService {
  constructor(private readonly repo: OrganizationRepository) {}

  // ── Industry Types ──────────────────────────────────────────────────────────

  async listIndustryTypes(): Promise<IndustryTypeRecord[]> {
    return this.repo.findAllIndustryTypes();
  }

  // ── List ────────────────────────────────────────────────────────────────────

  async list(
    pagination: PaginationParams,
    filters?: { status?: OrganizationStatus; industryTypeId?: string },
  ): Promise<PaginatedResult<OrganizationSummary>> {
    return this.repo.findAll(pagination, filters);
  }

  // ── Get one ─────────────────────────────────────────────────────────────────

  async getById(id: string): Promise<OrganizationRecord> {
    const org = await this.repo.findById(id);
    if (!org) {
      throw new OrganizationError(
        OrganizationErrorCode.NOT_FOUND,
        `Organization not found: ${id}`,
        404,
      );
    }
    return org;
  }

  // ── Create ──────────────────────────────────────────────────────────────────

  async create(dto: CreateOrganizationDto): Promise<OrganizationRecord> {
    // 1. Guard: organizationCode uniqueness
    const existing = await this.repo.findByCode(dto.organizationCode);
    if (existing) {
      throw new OrganizationError(
        OrganizationErrorCode.CODE_TAKEN,
        `Organization code already in use: ${dto.organizationCode}`,
        409,
      );
    }

    // 2. Guard: industryTypeId must exist
    const industry = await this.repo.findIndustryTypeById(dto.industryTypeId);
    if (!industry) {
      throw new OrganizationError(
        OrganizationErrorCode.INDUSTRY_NOT_FOUND,
        `Industry type not found: ${dto.industryTypeId}`,
        422,
      );
    }

    return this.repo.create(dto);
  }

  // ── Update ──────────────────────────────────────────────────────────────────

  async update(id: string, dto: UpdateOrganizationDto): Promise<OrganizationRecord> {
    // Verify organization exists
    await this.getById(id);
    return this.repo.update(id, dto);
  }

  // ── Status change ───────────────────────────────────────────────────────────

  async updateStatus(id: string, dto: UpdateOrganizationStatusDto): Promise<OrganizationRecord> {
    await this.getById(id);
    return this.repo.updateStatus(id, dto.status);
  }

  // ── Delete ──────────────────────────────────────────────────────────────────

  /**
   * Hard-deletes an organization.
   * Blocked if the organization has any users — prevents orphaned user records.
   * The schema uses @onDelete: Restrict on User.organizationId, so the DB
   * would throw anyway, but we give a cleaner application-level error.
   */
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
