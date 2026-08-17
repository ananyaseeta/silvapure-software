import { Router }       from 'express';
import { authenticate } from '../auth/middleware/authenticate.middleware';
import { requirePermission } from '../authorization/middleware/authorize.middleware';
import {
  PERM_ORGANIZATION_READ,
  PERM_ORGANIZATION_CREATE,
  PERM_ORGANIZATION_UPDATE,
  PERM_ORGANIZATION_DELETE,
} from '../authorization/constants/permissions';
import { requireOrgScope } from './scope.middleware';
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

// No scope guard needed — returns all industry types (reference data)
organizationRouter.get('/industry-types', listIndustryTypes);

// List is scoped inside OrganizationService.list() via OrgScopeService
organizationRouter.get('/',    requirePermission(PERM_ORGANIZATION_READ),   listOrganizations);

// Create is ADMIN-only by RBAC (organization.create) — no row-level guard needed
organizationRouter.post('/',   requirePermission(PERM_ORGANIZATION_CREATE), createOrganization);

// Row-level scope guard applied to all single-resource routes
organizationRouter.get('/:id',
  requirePermission(PERM_ORGANIZATION_READ),
  requireOrgScope,
  getOrganization,
);

organizationRouter.patch('/:id',
  requirePermission(PERM_ORGANIZATION_UPDATE),
  requireOrgScope,
  updateOrganization,
);

organizationRouter.patch('/:id/status',
  requirePermission(PERM_ORGANIZATION_UPDATE),
  requireOrgScope,
  updateOrganizationStatus,
);

organizationRouter.delete('/:id',
  requirePermission(PERM_ORGANIZATION_DELETE),
  requireOrgScope,
  deleteOrganization,
);
