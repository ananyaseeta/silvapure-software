/**
 * User Service
 *
 * All user management business logic lives here.
 * The service is unaware of HTTP.
 *
 * Business rules enforced:
 *   - Email must be globally unique.
 *   - organizationId must reference an existing organization.
 *   - All RoleCode values must exist in the database.
 *   - A user cannot delete themselves.
 *   - Password is hashed with Argon2id before storage.
 */

import type { RoleCode, UserStatus } from '@prisma/client';
import { hashPassword } from '../auth/utils/hash';
import type { UserRepository }  from './repository';
import type {
  UserRecord,
  UserSummary,
  CreateUserDto,
  UpdateUserDto,
  UpdateUserStatusDto,
  AssignRolesDto,
  UserPaginationParams,
  UserPaginatedResult,
} from './types';
import { UserError, UserErrorCode } from './types';

export class UserService {
  constructor(private readonly repo: UserRepository) {}

  // ── List ────────────────────────────────────────────────────────────────────

  async list(
    pagination: UserPaginationParams,
    filters?: { organizationId?: string; status?: UserStatus; search?: string },
  ): Promise<UserPaginatedResult<UserSummary>> {
    return this.repo.findAll(pagination, filters);
  }

  // ── Get one ─────────────────────────────────────────────────────────────────

  async getById(id: string): Promise<UserRecord> {
    const user = await this.repo.findById(id);
    if (!user) {
      throw new UserError(UserErrorCode.NOT_FOUND, `User not found: ${id}`, 404);
    }
    return user;
  }

  // ── Create ──────────────────────────────────────────────────────────────────

  async create(dto: CreateUserDto): Promise<UserRecord> {
    // 1. Email uniqueness
    const existing = await this.repo.findByEmail(dto.email);
    if (existing) {
      throw new UserError(UserErrorCode.EMAIL_TAKEN, `Email already in use: ${dto.email}`, 409);
    }

    // 2. Organization must exist
    const orgExists = await this.repo.organizationExists(dto.organizationId);
    if (!orgExists) {
      throw new UserError(
        UserErrorCode.ORG_NOT_FOUND,
        `Organization not found: ${dto.organizationId}`,
        422,
      );
    }

    // 3. Resolve role IDs
    const roleCodes = dto.roles ?? [];
    const roleIds   = await this.resolveRoleIds(roleCodes);

    // 4. Hash password
    const passwordHash = await hashPassword(dto.password);

    return this.repo.create({ ...dto, passwordHash }, roleIds);
  }

  // ── Update ──────────────────────────────────────────────────────────────────

  async update(id: string, dto: UpdateUserDto): Promise<UserRecord> {
    await this.getById(id);
    return this.repo.update(id, dto);
  }

  // ── Status change ───────────────────────────────────────────────────────────

  async updateStatus(
    id:          string,
    dto:         UpdateUserStatusDto,
    requesterId: string,
  ): Promise<UserRecord> {
    await this.getById(id);
    // Prevent self-deactivation to avoid lockouts
    if (id === requesterId) {
      throw new UserError(
        UserErrorCode.CANNOT_DELETE_SELF,
        'You cannot change your own account status',
        422,
      );
    }
    return this.repo.updateStatus(id, dto.status);
  }

  // ── Role assignment ─────────────────────────────────────────────────────────

  async assignRoles(id: string, dto: AssignRolesDto): Promise<UserRecord> {
    await this.getById(id);
    const roleIds = await this.resolveRoleIds(dto.roles);
    return this.repo.replaceRoles(id, roleIds);
  }

  // ── Delete ──────────────────────────────────────────────────────────────────

  async delete(id: string, requesterId: string): Promise<void> {
    await this.getById(id);
    if (id === requesterId) {
      throw new UserError(
        UserErrorCode.CANNOT_DELETE_SELF,
        'You cannot delete your own account',
        422,
      );
    }
    await this.repo.delete(id);
  }

  // ── Private helpers ──────────────────────────────────────────────────────────

  private async resolveRoleIds(codes: RoleCode[]): Promise<string[]> {
    if (codes.length === 0) return [];

    const found = await this.repo.findRoleIdsByCode(codes);
    const foundCodes = found.map((r) => r.code);
    const missing    = codes.filter((c) => !foundCodes.includes(c));

    if (missing.length > 0) {
      throw new UserError(
        UserErrorCode.ROLE_NOT_FOUND,
        `Role codes not found: ${missing.join(', ')}`,
        422,
      );
    }

    return found.map((r) => r.id);
  }
}
