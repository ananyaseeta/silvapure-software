import type { RoleCode, UserStatus } from '@prisma/client';
import { hashPassword } from '../auth/utils/hash';
import type { UserRepository } from './repository';
import type {
  UserRecord, UserSummary, CreateUserDto, UpdateUserDto,
  UpdateUserStatusDto, AssignRolesDto, UserPaginationParams, UserPaginatedResult,
} from './types';
import { UserError, UserErrorCode } from './types';
import type { OrgScopeService } from '../organization/scope.service';
import type { AuthUser } from '../auth/types/auth.types';
import { AuthorizationError } from '../authorization/errors/authorization.error';
import { AuthorizationErrorCode } from '../authorization/types/authorization.types';

export class UserService {
  constructor(
    private readonly repo:      UserRepository,
    private readonly scopeSvc?: OrgScopeService,
  ) {}

  /**
   * Lists users.
   * Non-admin users see only users within their own organization.
   * Admin users see all users.
   */
  async list(
    pagination:      UserPaginationParams,
    filters?:        { organizationId?: string; status?: UserStatus; search?: string },
    requester?:      AuthUser,
  ): Promise<UserPaginatedResult<UserSummary>> {
    if (requester && this.scopeSvc) {
      const isAdmin = await this.scopeSvc.isAdmin(requester.id);
      if (!isAdmin) {
        // Override any client-supplied organizationId — non-admin is always scoped to their own org
        return this.repo.findAll(pagination, { ...filters, organizationId: requester.organizationId });
      }
    }
    return this.repo.findAll(pagination, filters);
  }

  /**
   * Returns a user record by ID.
   * Verifies the target user belongs to the requester's organization unless ADMIN.
   */
  async getById(id: string, requester?: AuthUser): Promise<UserRecord> {
    const user = await this.repo.findById(id);
    if (!user) throw new UserError(UserErrorCode.NOT_FOUND, `User not found: ${id}`, 404);

    if (requester && this.scopeSvc) {
      const allowed = await this.scopeSvc.canAccess(requester, user.organizationId);
      if (!allowed) {
        throw new AuthorizationError(
          AuthorizationErrorCode.FORBIDDEN,
          'You do not have access to this user',
        );
      }
    }

    return user;
  }

  /**
   * Creates a user.
   * Verifies the requester may create users in the requested organization.
   */
  async create(dto: CreateUserDto, requester?: AuthUser): Promise<UserRecord> {
    // Org scope check — requester must have access to the target organization
    if (requester && this.scopeSvc) {
      const allowed = await this.scopeSvc.canAccess(requester, dto.organizationId);
      if (!allowed) {
        throw new AuthorizationError(
          AuthorizationErrorCode.FORBIDDEN,
          'You do not have permission to create users in this organization',
        );
      }
    }

    const existing = await this.repo.findByEmail(dto.email);
    if (existing) throw new UserError(UserErrorCode.EMAIL_TAKEN, `Email already in use: ${dto.email}`, 409);

    const orgExists = await this.repo.organizationExists(dto.organizationId);
    if (!orgExists) throw new UserError(UserErrorCode.ORG_NOT_FOUND, `Organization not found: ${dto.organizationId}`, 422);

    const roleIds      = await this.resolveRoleIds(dto.roles ?? []);
    const passwordHash = await hashPassword(dto.password);
    return this.repo.create({ ...dto, passwordHash }, roleIds);
  }

  /**
   * Updates a user's profile fields.
   * Verifies org scope before allowing modification.
   */
  async update(id: string, dto: UpdateUserDto, requester?: AuthUser): Promise<UserRecord> {
    await this.getById(id, requester); // scope check happens inside getById
    return this.repo.update(id, dto);
  }

  /**
   * Changes a user's status.
   * Prevents self-deactivation and enforces org scope.
   */
  async updateStatus(id: string, dto: UpdateUserStatusDto, requesterId: string, requester?: AuthUser): Promise<UserRecord> {
    await this.getById(id, requester);
    if (id === requesterId) {
      throw new UserError(UserErrorCode.CANNOT_DELETE_SELF, 'You cannot change your own account status', 422);
    }
    return this.repo.updateStatus(id, dto.status);
  }

  /**
   * Replaces all roles on a user.
   * Verifies org scope and prevents self-escalation.
   */
  async assignRoles(id: string, dto: AssignRolesDto, requesterId?: string, requester?: AuthUser): Promise<UserRecord> {
    await this.getById(id, requester);

    if (requesterId && id === requesterId) {
      throw new UserError(UserErrorCode.CANNOT_DELETE_SELF, 'You cannot assign roles to your own account', 422);
    }

    const roleIds = await this.resolveRoleIds(dto.roles);
    return this.repo.replaceRoles(id, roleIds);
  }

  /**
   * Hard-deletes a user.
   * Prevents self-deletion and enforces org scope.
   */
  async delete(id: string, requesterId: string, requester?: AuthUser): Promise<void> {
    await this.getById(id, requester);
    if (id === requesterId) {
      throw new UserError(UserErrorCode.CANNOT_DELETE_SELF, 'You cannot delete your own account', 422);
    }
    await this.repo.delete(id);
  }

  private async resolveRoleIds(codes: RoleCode[]): Promise<string[]> {
    if (codes.length === 0) return [];
    const found    = await this.repo.findRoleIdsByCode(codes);
    const missing  = codes.filter((c) => !found.map((r) => r.code).includes(c));
    if (missing.length > 0) {
      throw new UserError(UserErrorCode.ROLE_NOT_FOUND, `Role codes not found: ${missing.join(', ')}`, 422);
    }
    return found.map((r) => r.id);
  }
}
