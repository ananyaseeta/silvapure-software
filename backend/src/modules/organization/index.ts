/**
 * Organization Module Barrel
 *
 * Public surface of the organization module.
 */

export { organizationRouter } from './routes';
export { OrganizationService }    from './service';
export { OrganizationRepository } from './repository';
export { OrganizationError, OrganizationErrorCode } from './types';
export type {
  OrganizationRecord,
  OrganizationSummary,
  IndustryTypeRecord,
  CreateOrganizationDto,
  UpdateOrganizationDto,
  UpdateOrganizationStatusDto,
  PaginatedResult,
  PaginationParams,
} from './types';
