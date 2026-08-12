import type { Request, Response, NextFunction } from 'express';
import { OrganizationService }    from './service';
import { OrganizationRepository } from './repository';
import { prisma }                  from '../../config/prisma';
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  updateOrganizationStatusSchema,
  listOrganizationsQuerySchema,
  idParamSchema,
} from './validation';
import type { CreateOrganizationDto, UpdateOrganizationDto } from './types';

function getService(): OrganizationService {
  return new OrganizationService(new OrganizationRepository(prisma));
}

/**
 * @swagger
 * /api/organizations/industry-types:
 *   get:
 *     summary: List all available industry types
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Industry types retrieved
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
export async function listIndustryTypes(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await getService().listIndustryTypes();
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
}

/**
 * @swagger
 * /api/organizations:
 *   get:
 *     summary: List organizations with pagination and filters
 *     tags: [Organizations]
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
 *         name: status
 *         schema: { type: string, enum: [ACTIVE, INACTIVE] }
 *       - in: query
 *         name: industryTypeId
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Paginated list of organizations
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
export async function listOrganizations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query  = listOrganizationsQuerySchema.parse(req.query);
    const result = await getService().list(
      { page: query.page, limit: query.limit },
      {
        ...(query.status         !== undefined ? { status:         query.status }         : {}),
        ...(query.industryTypeId !== undefined ? { industryTypeId: query.industryTypeId } : {}),
      },
    );
    res.status(200).json({ success: true, data: result });
  } catch (err) { next(err); }
}

/**
 * @swagger
 * /api/organizations/{id}:
 *   get:
 *     summary: Get organization by ID
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Organization details
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
export async function getOrganization(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = idParamSchema.parse(req.params);
    const org    = await getService().getById(id);
    res.status(200).json({ success: true, data: org });
  } catch (err) { next(err); }
}

/**
 * @swagger
 * /api/organizations:
 *   post:
 *     summary: Create a new organization
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [organizationCode, legalName, displayName, industryTypeId]
 *             properties:
 *               organizationCode: { type: string, example: SILVAPURE-001 }
 *               legalName:        { type: string }
 *               displayName:      { type: string }
 *               industryTypeId:   { type: string, format: uuid }
 *               email:            { type: string, format: email }
 *               phone:            { type: string }
 *               website:          { type: string, format: uri }
 *     responses:
 *       201:
 *         description: Organization created
 *       409:
 *         description: Organization code already in use
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
export async function createOrganization(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const raw = createOrganizationSchema.parse(req.body);
    const dto: CreateOrganizationDto = {
      organizationCode: raw.organizationCode,
      legalName:        raw.legalName,
      displayName:      raw.displayName,
      industryTypeId:   raw.industryTypeId,
      ...(raw.email   !== undefined ? { email:   raw.email }   : {}),
      ...(raw.phone   !== undefined ? { phone:   raw.phone }   : {}),
      ...(raw.website !== undefined ? { website: raw.website } : {}),
    };
    const org = await getService().create(dto);
    res.status(201).json({ success: true, data: org });
  } catch (err) { next(err); }
}

/**
 * @swagger
 * /api/organizations/{id}:
 *   patch:
 *     summary: Update organization details
 *     tags: [Organizations]
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
 *               legalName:   { type: string }
 *               displayName: { type: string }
 *               email:       { type: string, format: email }
 *               phone:       { type: string }
 *               website:     { type: string, format: uri }
 *     responses:
 *       200:
 *         description: Organization updated
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
export async function updateOrganization(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = idParamSchema.parse(req.params);
    const raw    = updateOrganizationSchema.parse(req.body);
    const dto: UpdateOrganizationDto = {
      ...(raw.legalName   !== undefined ? { legalName:   raw.legalName }   : {}),
      ...(raw.displayName !== undefined ? { displayName: raw.displayName } : {}),
      ...(raw.email       !== undefined ? { email:       raw.email }       : {}),
      ...(raw.phone       !== undefined ? { phone:       raw.phone }       : {}),
      ...(raw.website     !== undefined ? { website:     raw.website }     : {}),
    };
    const org = await getService().update(id, dto);
    res.status(200).json({ success: true, data: org });
  } catch (err) { next(err); }
}

/**
 * @swagger
 * /api/organizations/{id}/status:
 *   patch:
 *     summary: Update organization status
 *     tags: [Organizations]
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
 *               status: { type: string, enum: [ACTIVE, INACTIVE] }
 *     responses:
 *       200:
 *         description: Status updated
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
export async function updateOrganizationStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = idParamSchema.parse(req.params);
    const dto    = updateOrganizationStatusSchema.parse(req.body);
    const org    = await getService().updateStatus(id, dto);
    res.status(200).json({ success: true, data: org });
  } catch (err) { next(err); }
}

/**
 * @swagger
 * /api/organizations/{id}:
 *   delete:
 *     summary: Hard-delete an organization (only if it has no users)
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: Organization deleted
 *       409:
 *         description: Organization has users
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
export async function deleteOrganization(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = idParamSchema.parse(req.params);
    await getService().delete(id);
    res.status(204).send();
  } catch (err) { next(err); }
}
