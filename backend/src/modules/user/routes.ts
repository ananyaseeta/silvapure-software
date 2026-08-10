/**
 * User Routes
 *
 * Mounted at /api/users by app.ts.
 *
 * Route summary:
 *   GET    /me              — current authenticated user profile (auth only)
 *   GET    /                — list users, paginated   (user.read)
 *   POST   /                — create user             (user.create)
 *   GET    /:id             — get user by id          (user.read)
 *   PUT    /:id             — update user profile     (user.update)
 *   PATCH  /:id/status      — change user status      (user.activate | user.deactivate)
 *   PUT    /:id/roles       — replace user roles      (user.assign_role)
 *   DELETE /:id             — delete user             (user.delete)
 *
 * @swagger
 * tags:
 *   name: Users
 *   description: User account management
 */

import { Router } from 'express';
import { authenticate } from '../auth/middleware/authenticate.middleware';
import {
  requirePermission,
  requireAnyPermission,
} from '../authorization/middleware/authorize.middleware';
import {
  PERM_USER_READ,
  PERM_USER_CREATE,
  PERM_USER_UPDATE,
  PERM_USER_DELETE,
  PERM_USER_ASSIGN_ROLE,
  PERM_USER_ACTIVATE,
  PERM_USER_DEACTIVATE,
} from '../authorization/constants/permissions';
import {
  listUsers,
  getUser,
  getMe,
  createUser,
  updateUser,
  updateUserStatus,
  assignUserRoles,
  deleteUser,
} from './controller';

export const userRouter = Router();

// All user routes require authentication
userRouter.use(authenticate);

// Current user — no extra permission required (every authenticated user can read their own profile)
userRouter.get('/me', getMe);

// CRUD
userRouter.get('/',    requirePermission(PERM_USER_READ),   listUsers);
userRouter.post('/',   requirePermission(PERM_USER_CREATE), createUser);
userRouter.get('/:id', requirePermission(PERM_USER_READ),   getUser);
userRouter.put('/:id', requirePermission(PERM_USER_UPDATE), updateUser);

// Status change — requires either activate or deactivate permission
userRouter.patch(
  '/:id/status',
  requireAnyPermission([PERM_USER_ACTIVATE, PERM_USER_DEACTIVATE]),
  updateUserStatus,
);

// Role assignment
userRouter.put('/:id/roles', requirePermission(PERM_USER_ASSIGN_ROLE), assignUserRoles);

// Delete
userRouter.delete('/:id', requirePermission(PERM_USER_DELETE), deleteUser);
