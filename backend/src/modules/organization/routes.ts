import { Router }       from 'express';
import { authenticate } from '../auth/middleware/authenticate.middleware';
import { requirePermission } from '../authorization/middleware/authorize.middleware';
import {
  PERM_ORGANIZATION_READ,
  PERM_ORGANIZATION_CREATE,
  PERM_ORGANIZATION_UPDATE,
  PERM_ORGANIZATION_DELETE,
} from '../authorization/constants/permissions';
import {
  listIndustryTypes,
  listOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  updateOrganizationStatus,
  deleteOrganization,
} from './controller';

/**
 * @swagger
 * tags:
 *   name: Organizations
 *   description: Organization management
 */

export const organizationRouter = Router();

organizationRouter.use(authenticate);

organizationRouter.get('/industry-types', listIndustryTypes);
organizationRouter.get('/',    requirePermission(PERM_ORGANIZATION_READ),   listOrganizations);
organizationRouter.post('/',   requirePermission(PERM_ORGANIZATION_CREATE), createOrganization);
organizationRouter.get('/:id', requirePermission(PERM_ORGANIZATION_READ),   getOrganization);
organizationRouter.patch('/:id',        requirePermission(PERM_ORGANIZATION_UPDATE), updateOrganization);
organizationRouter.patch('/:id/status', requirePermission(PERM_ORGANIZATION_UPDATE), updateOrganizationStatus);
organizationRouter.delete('/:id',       requirePermission(PERM_ORGANIZATION_DELETE), deleteOrganization);
