import type { OrganizationStatus } from '@prisma/client';

export interface IndustryTypeRecord {
  id:          string;
  name:        string;
  description: string | null;
}

export interface OrganizationRecord {
  id:               string;
  organizationCode: string;
  legalName:        string;
  displayName:      string;
  email:            string | null;
  phone:            string | null;
  website:          string | null;
  status:           OrganizationStatus;
  industryTypeId:   string;
  industryType:     IndustryTypeRecord;
  createdAt:        Date;
  updatedAt:        Date;
}

export interface OrganizationSummary {
  id:               string;
  organizationCode: string;
  legalName:        string;
  displayName:      string;
  status:           OrganizationStatus;
  industryType:     string;
  createdAt:        Date;
}

export interface CreateOrganizationDto {
  organizationCode: string;
  legalName:        string;
  displayName:      string;
  industryTypeId:   string;
  email?:           string;
  phone?:           string;
  website?:         string;
}

export interface UpdateOrganizationDto {
  legalName?:   string;
  displayName?: string;
  email?:       string | null;
  phone?:       string | null;
  website?:     string | null;
}

export interface UpdateOrganizationStatusDto {
  status: OrganizationStatus;
}

export interface PaginationParams {
  page:  number;
  limit: number;
}

export interface PaginatedResult<T> {
  data:       T[];
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
}

export const OrganizationErrorCode = {
  NOT_FOUND:            'ORG_NOT_FOUND',
  CODE_TAKEN:           'ORG_CODE_TAKEN',
  INDUSTRY_NOT_FOUND:   'ORG_INDUSTRY_NOT_FOUND',
  CANNOT_DELETE_ACTIVE: 'ORG_CANNOT_DELETE_ACTIVE',
} as const;

export type OrganizationErrorCode = (typeof OrganizationErrorCode)[keyof typeof OrganizationErrorCode];

export class OrganizationError extends Error {
  public readonly code:       OrganizationErrorCode;
  public readonly statusHint: number;

  constructor(code: OrganizationErrorCode, message: string, statusHint = 400) {
    super(message);
    this.name       = 'OrganizationError';
    this.code       = code;
    this.statusHint = statusHint;
  }
}
