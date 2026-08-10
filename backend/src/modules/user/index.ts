/**
 * User Module Barrel
 */

export { userRouter }    from './routes';
export { UserService }   from './service';
export { UserRepository } from './repository';
export { UserError, UserErrorCode } from './types';
export type {
  UserRecord,
  UserSummary,
  UserRoleRecord,
  CreateUserDto,
  UpdateUserDto,
  UpdateUserStatusDto,
  AssignRolesDto,
  UserPaginationParams,
  UserPaginatedResult,
} from './types';
