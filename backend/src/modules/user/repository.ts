/**
 * User Repository
 *
 * Single point of contact between the user module and the database.
 * No business logic — only data access.
 */

import type { PrismaClient, UserStatus, RoleCode } from '@prisma/client';
import type {
  UserRecord,
  UserSummary,
  CreateUserDto,
  UpdateUserDto,
  UserPaginationParams,
  UserPaginatedResult,
} from './types';

// ─── Reusable Prisma selector ─────────────────────────────────────────────────

const FULL_SELECT = {
  id:             true,
  organizationId: true,
  firstName:      true,
  lastName:       true,
  email:          true,
  phone:          true,
  jobTitle:       true,
  status:         true,
  createdAt:      true,
  updatedAt:      true,
  userRoles: {
    select: {
      roleId: true,
      role: {
        select: {
          code: true,
          name: true,
        },
      },
    },
  },
} as const;

function mapToRecord(row: {
  id: string; organizationId: string; firstName: string; lastName: string | null;
  email: string; phone: string | null; jobTitle: string | null; status: UserStatus;
  createdAt: Date; updatedAt: Date;
  userRoles: Array<{ roleId: string; role: { code: RoleCode; name: string } }>;
}): UserRecord {
  return {
    id:             row.id,
    organizationId: row.organizationId,
    firstName:      row.firstName,
    lastName:       row.lastName,
    email:          row.email,
    phone:          row.phone,
    jobTitle:       row.jobTitle,
    status:         row.status,
    roles:          row.userRoles.map((ur) => ({
      roleId:   ur.roleId,
      roleCode: ur.role.code,
      roleName: ur.role.name,
    })),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // ── Lookups ──────────────────────────────────────────────────────────────────

  async findById(id: string): Promise<UserRecord | null> {
    const row = await this.prisma.user.findUnique({
      where:  { id },
      select: FULL_SELECT,
    });
    return row ? mapToRecord(row) : null;
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const row = await this.prisma.user.findUnique({
      where:  { email },
      select: FULL_SELECT,
    });
    return row ? mapToRecord(row) : null;
  }

  // ── List ──────────────────────────────────────────────────────────────────────

  async findAll(
    params: UserPaginationParams,
    filters?: {
      organizationId?: string;
      status?:         UserStatus;
      search?:         string;
    },
  ): Promise<UserPaginatedResult<UserSummary>> {
    const where = {
      ...(filters?.organizationId ? { organizationId: filters.organizationId } : {}),
      ...(filters?.status         ? { status:         filters.status }         : {}),
      ...(filters?.search
        ? {
            OR: [
              { firstName: { contains: filters.search, mode: 'insensitive' as const } },
              { lastName:  { contains: filters.search, mode: 'insensitive' as const } },
              { email:     { contains: filters.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [total, rows] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        select: {
          id:             true,
          organizationId: true,
          firstName:      true,
          lastName:       true,
          email:          true,
          jobTitle:       true,
          status:         true,
          createdAt:      true,
          userRoles: {
            select: {
              role: { select: { code: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip:    (params.page - 1) * params.limit,
        take:    params.limit,
      }),
    ]);

    const data: UserSummary[] = rows.map((r) => ({
      id:             r.id,
      organizationId: r.organizationId,
      firstName:      r.firstName,
      lastName:       r.lastName,
      email:          r.email,
      jobTitle:       r.jobTitle,
      status:         r.status,
      roles:          r.userRoles.map((ur) => ur.role.code),
      createdAt:      r.createdAt,
    }));

    return {
      data,
      total,
      page:       params.page,
      limit:      params.limit,
      totalPages: Math.ceil(total / params.limit),
    };
  }

  // ── Create ────────────────────────────────────────────────────────────────────

  async create(
    dto: CreateUserDto & { passwordHash: string },
    roleIds: string[],
  ): Promise<UserRecord> {
    const row = await this.prisma.user.create({
      data: {
        organizationId: dto.organizationId,
        firstName:      dto.firstName,
        lastName:       dto.lastName   ?? null,
        email:          dto.email,
        passwordHash:   dto.passwordHash,
        phone:          dto.phone      ?? null,
        jobTitle:       dto.jobTitle   ?? null,
        userRoles: {
          create: roleIds.map((roleId) => ({ roleId })),
        },
      },
      select: FULL_SELECT,
    });
    return mapToRecord(row);
  }

  // ── Update ────────────────────────────────────────────────────────────────────

  async update(id: string, dto: UpdateUserDto): Promise<UserRecord> {
    const row = await this.prisma.user.update({
      where: { id },
      data:  {
        ...(dto.firstName !== undefined ? { firstName: dto.firstName } : {}),
        ...(dto.lastName  !== undefined ? { lastName:  dto.lastName }  : {}),
        ...(dto.phone     !== undefined ? { phone:     dto.phone }     : {}),
        ...(dto.jobTitle  !== undefined ? { jobTitle:  dto.jobTitle }  : {}),
      },
      select: FULL_SELECT,
    });
    return mapToRecord(row);
  }

  async updateStatus(id: string, status: UserStatus): Promise<UserRecord> {
    const row = await this.prisma.user.update({
      where:  { id },
      data:   { status },
      select: FULL_SELECT,
    });
    return mapToRecord(row);
  }

  // ── Role management ───────────────────────────────────────────────────────────

  async replaceRoles(userId: string, roleIds: string[]): Promise<UserRecord> {
    await this.prisma.userRole.deleteMany({ where: { userId } });
    if (roleIds.length > 0) {
      await this.prisma.userRole.createMany({
        data: roleIds.map((roleId) => ({ userId, roleId })),
      });
    }
    const row = await this.prisma.user.findUniqueOrThrow({
      where:  { id: userId },
      select: FULL_SELECT,
    });
    return mapToRecord(row);
  }

  // ── Delete ────────────────────────────────────────────────────────────────────

  async delete(id: string): Promise<void> {
    // UserRole rows cascade-delete via schema @onDelete: Cascade
    await this.prisma.user.delete({ where: { id } });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────

  async findRoleIdsByCode(codes: RoleCode[]): Promise<Array<{ id: string; code: RoleCode }>> {
    return this.prisma.role.findMany({
      where:  { code: { in: codes } },
      select: { id: true, code: true },
    });
  }

  async organizationExists(organizationId: string): Promise<boolean> {
    const count = await this.prisma.organization.count({ where: { id: organizationId } });
    return count > 0;
  }
}
