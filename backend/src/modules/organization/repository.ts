/**
 * Organization Repository
 *
 * Single point of contact between the organization module and the database.
 * No business logic — only data access. Maps Prisma rows to domain types.
 */

import type { PrismaClient } from '@prisma/client';
import type {
  OrganizationRecord,
  OrganizationSummary,
  IndustryTypeRecord,
  CreateOrganizationDto,
  UpdateOrganizationDto,
  PaginationParams,
  PaginatedResult,
} from './types';
import type { OrganizationStatus } from '@prisma/client';

// ─── Selector for full organization record ────────────────────────────────────

const FULL_SELECT = {
  id:               true,
  organizationCode: true,
  legalName:        true,
  displayName:      true,
  email:            true,
  phone:            true,
  website:          true,
  status:           true,
  industryTypeId:   true,
  createdAt:        true,
  updatedAt:        true,
  industryType: {
    select: {
      id:          true,
      name:        true,
      description: true,
    },
  },
} as const;

export class OrganizationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // ── Industry Types ──────────────────────────────────────────────────────────

  async findAllIndustryTypes(): Promise<IndustryTypeRecord[]> {
    return this.prisma.industryType.findMany({
      select: { id: true, name: true, description: true },
      orderBy: { name: 'asc' },
    });
  }

  async findIndustryTypeById(id: string): Promise<IndustryTypeRecord | null> {
    return this.prisma.industryType.findUnique({
      where:  { id },
      select: { id: true, name: true, description: true },
    });
  }

  // ── Organizations ───────────────────────────────────────────────────────────

  async findById(id: string): Promise<OrganizationRecord | null> {
    return this.prisma.organization.findUnique({
      where:  { id },
      select: FULL_SELECT,
    });
  }

  async findByCode(code: string): Promise<OrganizationRecord | null> {
    return this.prisma.organization.findUnique({
      where:  { organizationCode: code },
      select: FULL_SELECT,
    });
  }

  async findAll(
    params: PaginationParams,
    filters?: { status?: OrganizationStatus; industryTypeId?: string },
  ): Promise<PaginatedResult<OrganizationSummary>> {
    const where = {
      ...(filters?.status         ? { status:         filters.status }         : {}),
      ...(filters?.industryTypeId ? { industryTypeId: filters.industryTypeId } : {}),
    };

    const [total, rows] = await Promise.all([
      this.prisma.organization.count({ where }),
      this.prisma.organization.findMany({
        where,
        select: {
          id:               true,
          organizationCode: true,
          legalName:        true,
          displayName:      true,
          status:           true,
          createdAt:        true,
          industryType:     { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip:    (params.page - 1) * params.limit,
        take:    params.limit,
      }),
    ]);

    const data: OrganizationSummary[] = rows.map((r) => ({
      id:               r.id,
      organizationCode: r.organizationCode,
      legalName:        r.legalName,
      displayName:      r.displayName,
      status:           r.status,
      industryType:     r.industryType.name,
      createdAt:        r.createdAt,
    }));

    return {
      data,
      total,
      page:       params.page,
      limit:      params.limit,
      totalPages: Math.ceil(total / params.limit),
    };
  }

  async create(dto: CreateOrganizationDto): Promise<OrganizationRecord> {
    return this.prisma.organization.create({
      data: {
        organizationCode: dto.organizationCode,
        legalName:        dto.legalName,
        displayName:      dto.displayName,
        industryTypeId:   dto.industryTypeId,
        email:            dto.email   ?? null,
        phone:            dto.phone   ?? null,
        website:          dto.website ?? null,
      },
      select: FULL_SELECT,
    });
  }

  async update(id: string, dto: UpdateOrganizationDto): Promise<OrganizationRecord> {
    return this.prisma.organization.update({
      where:  { id },
      data: {
        ...(dto.legalName   !== undefined ? { legalName:   dto.legalName }   : {}),
        ...(dto.displayName !== undefined ? { displayName: dto.displayName } : {}),
        ...(dto.email       !== undefined ? { email:       dto.email }       : {}),
        ...(dto.phone       !== undefined ? { phone:       dto.phone }       : {}),
        ...(dto.website     !== undefined ? { website:     dto.website }     : {}),
      },
      select: FULL_SELECT,
    });
  }

  async updateStatus(id: string, status: OrganizationStatus): Promise<OrganizationRecord> {
    return this.prisma.organization.update({
      where:  { id },
      data:   { status },
      select: FULL_SELECT,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.organization.delete({ where: { id } });
  }

  /** Returns the number of users belonging to an organization. */
  async countUsers(organizationId: string): Promise<number> {
    return this.prisma.user.count({ where: { organizationId } });
  }
}
