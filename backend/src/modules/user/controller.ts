/**
 * User Controller
 *
 * HTTP concerns only — parses requests, delegates to UserService, shapes responses.
 * All business logic is in service.ts.
 *
 * Response format matches project standard:
 *   Success: { success: true, data: { ... } }
 *   Error:   next(err)  →  global handler in app.ts
 *
 * @module user/controller
 */

import type { Request, Response, NextFunction } from 'express';
import { UserService }     from './service';
import { UserRepository }  from './repository';
import { prisma }          from '../../config/prisma';
import type { AuthenticatedRequest } from '../auth/types/auth.types';
import {
  createUserSchema,
  updateUserSchema,
  updateUserStatusSchema,
  assignRolesSchema,
  listUsersQuerySchema,
  userIdParamSchema,
} from './validation';

// ─── Service factory ──────────────────────────────────────────────────────────

function getService(): UserService {
  return new UserService(new UserRepository(prisma));
}

// ─── List users ───────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List users with pagination and filters
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *       - in: query
 *         name: organizationId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [ACTIVE, INACTIVE, SUSPENDED] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Fuzzy search on first name, last name, or email
 *     responses:
 *       200:
 *         description: Paginated list of users
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
export async function listUsers(
  req:  Request,
  res:  Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query  = listUsersQuerySchema.parse(req.query);
    const result = await getService().list(
      { page: query.page, limit: query.limit },
      {
        ...(query.organizationId !== undefined ? { organizationId: query.organizationId } : {}),
        ...(query.status         !== undefined ? { status:         query.status }         : {}),
        ...(query.search         !== undefined ? { search:         query.search }         : {}),
      },
    );
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

// ─── Get user ─────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
export async function getUser(
  req:  Request,
  res:  Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = userIdParamSchema.parse(req.params);
    const user   = await getService().getById(id);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

// ─── Get current user (me) ────────────────────────────────────────────────────

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get the currently authenticated user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
export async function getMe(
  req:  Request,
  res:  Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authedReq = req as AuthenticatedRequest;
    const user = await getService().getById(authedReq.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

// ─── Create user ──────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [organizationId, firstName, email, password]
 *             properties:
 *               organizationId: { type: string, format: uuid }
 *               firstName:      { type: string, example: Jane }
 *               lastName:       { type: string, example: Doe }
 *               email:          { type: string, format: email }
 *               password:       { type: string, format: password }
 *               phone:          { type: string }
 *               jobTitle:       { type: string }
 *               roles:
 *                 type: array
 *                 items: { type: string, enum: [ADMIN, PLANT_MANAGER, OPERATOR, ENVIRONMENTAL_OFFICER, VIEWER] }
 *     responses:
 *       201:
 *         description: User created
 *       409:
 *         description: Email already in use
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
export async function createUser(
  req:  Request,
  res:  Response,
  next: NextFunction,
): Promise<void> {
  try {
    const raw = createUserSchema.parse(req.body);
    const dto = {
      organizationId: raw.organizationId,
      firstName:      raw.firstName,
      email:          raw.email,
      password:       raw.password,
      ...(raw.lastName !== undefined ? { lastName: raw.lastName } : {}),
      ...(raw.phone    !== undefined ? { phone:    raw.phone }    : {}),
      ...(raw.jobTitle !== undefined ? { jobTitle: raw.jobTitle } : {}),
      ...(raw.roles    !== undefined ? { roles:    raw.roles }    : {}),
    };
    const user = await getService().create(dto);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

// ─── Update user ──────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user's profile fields
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               lastName:  { type: string, nullable: true }
 *               phone:     { type: string, nullable: true }
 *               jobTitle:  { type: string, nullable: true }
 *     responses:
 *       200:
 *         description: User updated
 *       404:
 *         description: User not found
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
export async function updateUser(
  req:  Request,
  res:  Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = userIdParamSchema.parse(req.params);
    const raw    = updateUserSchema.parse(req.body);
    const dto = {
      ...(raw.firstName !== undefined ? { firstName: raw.firstName } : {}),
      ...(raw.lastName  !== undefined ? { lastName:  raw.lastName }  : {}),
      ...(raw.phone     !== undefined ? { phone:     raw.phone }     : {}),
      ...(raw.jobTitle  !== undefined ? { jobTitle:  raw.jobTitle }  : {}),
    };
    const user = await getService().update(id, dto);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

// ─── Update user status ───────────────────────────────────────────────────────

/**
 * @swagger
 * /api/users/{id}/status:
 *   patch:
 *     summary: Activate, deactivate, or suspend a user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [ACTIVE, INACTIVE, SUSPENDED] }
 *     responses:
 *       200:
 *         description: Status updated
 *       422:
 *         description: Cannot change own status
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
export async function updateUserStatus(
  req:  Request,
  res:  Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id }    = userIdParamSchema.parse(req.params);
    const dto       = updateUserStatusSchema.parse(req.body);
    const authedReq = req as AuthenticatedRequest;
    const user      = await getService().updateStatus(id, dto, authedReq.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

// ─── Assign roles ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/users/{id}/roles:
 *   put:
 *     summary: Replace all roles on a user (full replacement, not additive)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [roles]
 *             properties:
 *               roles:
 *                 type: array
 *                 items: { type: string, enum: [ADMIN, PLANT_MANAGER, OPERATOR, ENVIRONMENTAL_OFFICER, VIEWER] }
 *     responses:
 *       200:
 *         description: Roles updated
 *       422:
 *         description: One or more role codes invalid
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
export async function assignUserRoles(
  req:  Request,
  res:  Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = userIdParamSchema.parse(req.params);
    const dto    = assignRolesSchema.parse(req.body);
    const user   = await getService().assignRoles(id, dto);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

// ─── Delete user ──────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Hard-delete a user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: User deleted
 *       422:
 *         description: Cannot delete own account
 *       404:
 *         description: User not found
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
export async function deleteUser(
  req:  Request,
  res:  Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id }    = userIdParamSchema.parse(req.params);
    const authedReq = req as AuthenticatedRequest;
    await getService().delete(id, authedReq.user.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
