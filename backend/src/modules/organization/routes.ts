/**
 * Organization Routes
 *
 * Mounted at /api/organizations by app.ts.
 *
 * Route summary:
 *   GET    /industry-types        — list all industry types (auth required)
 *   GET    /                      — list organizations, paginated (requires organization.read)
 *   POST   /                      — create organization (requires organization.create)
 *   GET    /:id                   — get organization by id (requires organization.read)
 *   PATCH  /:id                   — update organization (requires organization.update)
 *   PATCH  /:id/status            — change status (requires organization.update)
 *   DELETE /:id                   — delete organization (requires organization.delete)
 */

import { Router }       from 'express';
import { authenticate } from '../auth/middleware/authenticate.middleware';
import {
  requirePermission,
} from '../authorization/middleware/authorize.middleware';
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

// All organization routes require authentication
organizationRouter.use(authenticate);

// ── Industry Types ────────────────────────────────────────────────────────────
// Anyone authenticated can read industry types (used in UI dropdowns)
organizationRouter.get(
  '/industry-types',
  listIndustryTypes,
);

// ── Organizations ─────────────────────────────────────────────────────────────
organizationRouter.get(
  '/',
  requirePermission(PERM_ORGANIZATION_READ),
  listOrganizations,
);

organizationRouter.post(
  '/',
  requirePermission(PERM_ORGANIZATION_CREATE),
  createOrganization,
);

organizationRouter.get(
  '/:id',
  requirePermission(PERM_ORGANIZATION_READ),
  getOrganization,
);

organizationRouter.patch(
  '/:id',
  requirePermission(PERM_ORGANIZATION_UPDATE),
  updateOrganization,
);

organizationRouter.patch(
  '/:id/status',
  requirePermission(PERM_ORGANIZATION_UPDATE),
  updateOrganizationStatus,
);

organizationRouter.delete(
  '/:id',
  requirePermission(PERM_ORGANIZATION_DELETE),
  deleteOrganization,
);
