import type { Request, Response, NextFunction } from 'express';
import { OrganizationService }    from './service';
import { OrganizationRepository } from './repository';
import { orgScopeService }        from './scope.service';
import { prisma }                  from '../../config/prisma';
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  updateOrganizationStatusSchema,
  listOrganizationsQuerySchema,
  idParamSchema,
} from './validation';
import type { CreateOrganizationDto, UpdateOrganizationDto } from './types';
import type { AuthenticatedRequest } from '../auth/types/auth.types';
import { auditService, AuditAction, AuditResource } from '../audit/audit.service';

function getService(): OrganizationService {
  return new OrganizationService(new OrganizationRepository(prisma), orgScopeService);
}

function meta(req: Request): { ipAddress?: string; userAgent?: string } {
  const raw = (req.headers['x-forwarded-for'] as string | undefined) ?? req.socket?.remoteAddress;
  const ip  = raw?.split(',')[0]?.trim();
  return {
    ...(ip        ? { ipAddress: ip }                               : {}),
    ...(req.headers['user-agent'] ? { userAgent: req.headers['user-agent'] } : {}),
  };
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
    const authedReq = req as AuthenticatedRequest;
    const query  = listOrganizationsQuerySchema.parse(req.query);
    const result = await getService().list(
      { page: query.page, limit: query.limit },
      {
        ...(query.status         !== undefined ? { status:         query.status }         : {}),
        ...(query.industryTypeId !== undefined ? { industryTypeId: query.industryTypeId } : {}),
      },
      authedReq.user.id,
      authedReq.user.organizationId,
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
    const authedReq = req as AuthenticatedRequest;
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
    void auditService.record({
      userId:       authedReq.user.id,
      action:       AuditAction.ORG_CREATED,
      resourceType: AuditResource.ORGANIZATION,
      resourceId:   org.id,
      newValues:    { organizationCode: org.organizationCode, legalName: org.legalName, status: org.status },
      ...meta(req),
    });
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
    const authedReq = req as AuthenticatedRequest;
    const { id } = idParamSchema.parse(req.params);
    const before = await getService().getById(id);
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
    void auditService.record({
      userId:       authedReq.user.id,
      action:       AuditAction.ORG_UPDATED,
      resourceType: AuditResource.ORGANIZATION,
      resourceId:   id,
      oldValues:    { legalName: before.legalName, displayName: before.displayName, email: before.email, phone: before.phone, website: before.website },
      newValues:    { legalName: org.legalName, displayName: org.displayName, email: org.email, phone: org.phone, website: org.website },
      ...meta(req),
    });
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
    const authedReq = req as AuthenticatedRequest;
    const { id } = idParamSchema.parse(req.params);
    const before  = await getService().getById(id);
    const dto     = updateOrganizationStatusSchema.parse(req.body);
    const org     = await getService().updateStatus(id, dto);
    res.status(200).json({ success: true, data: org });
    void auditService.record({
      userId:       authedReq.user.id,
      action:       AuditAction.ORG_STATUS_CHANGED,
      resourceType: AuditResource.ORGANIZATION,
      resourceId:   id,
      oldValues:    { status: before.status },
      newValues:    { status: org.status },
      ...meta(req),
    });
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
    const authedReq = req as AuthenticatedRequest;
    const { id }  = idParamSchema.parse(req.params);
    const before  = await getService().getById(id);
    await getService().delete(id);
    res.status(204).send();
    void auditService.record({
      userId:       authedReq.user.id,
      action:       AuditAction.ORG_DELETED,
      resourceType: AuditResource.ORGANIZATION,
      resourceId:   id,
      oldValues:    { organizationCode: before.organizationCode, legalName: before.legalName },
      ...meta(req),
    });
  } catch (err) { next(err); }
}
