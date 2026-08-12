import { Router } from 'express';
import { authenticate } from '../auth/middleware/authenticate.middleware';
import { requirePermission, requireAnyPermission } from '../authorization/middleware/authorize.middleware';
import {
  PERM_USER_READ, PERM_USER_CREATE, PERM_USER_UPDATE,
  PERM_USER_DELETE, PERM_USER_ASSIGN_ROLE, PERM_USER_ACTIVATE, PERM_USER_DEACTIVATE,
} from '../authorization/constants/permissions';
import {
  listUsers, getUser, getMe, createUser, updateUser,
  updateUserStatus, assignUserRoles, deleteUser,
} from './controller';

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User account management
 */

export const userRouter = Router();

userRouter.use(authenticate);

userRouter.get('/me', getMe);
userRouter.get('/',    requirePermission(PERM_USER_READ),   listUsers);
userRouter.post('/',   requirePermission(PERM_USER_CREATE), createUser);
userRouter.get('/:id', requirePermission(PERM_USER_READ),   getUser);
userRouter.put('/:id', requirePermission(PERM_USER_UPDATE), updateUser);
userRouter.patch('/:id/status', requireAnyPermission([PERM_USER_ACTIVATE, PERM_USER_DEACTIVATE]), updateUserStatus);
userRouter.put('/:id/roles',    requirePermission(PERM_USER_ASSIGN_ROLE), assignUserRoles);
userRouter.delete('/:id',       requirePermission(PERM_USER_DELETE),      deleteUser);
