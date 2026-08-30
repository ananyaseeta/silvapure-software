export { organizationRouter }    from './routes';
export { OrganizationService }   from './service';
export { OrganizationRepository } from './repository';
export { OrgScopeService, orgScopeService } from './scope.service';
export { requireOrgScope }       from './scope.middleware';
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
