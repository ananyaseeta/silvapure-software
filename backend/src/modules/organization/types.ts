/**
 * Organization Module — Domain Types
 *
 * All interfaces and value objects used across the organization module.
 * Prisma types are never exposed outside the repository layer.
 */

import type { OrganizationStatus } from '@prisma/client';

// ─── Read projections ─────────────────────────────────────────────────────────

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

/** Lightweight list projection — omits nullable fields for list views. */
export interface OrganizationSummary {
  id:               string;
  organizationCode: string;
  legalName:        string;
  displayName:      string;
  status:           OrganizationStatus;
  industryType:     string; // industryType.name
  createdAt:        Date;
}

// ─── Write DTOs (validated at the validation layer before reaching service) ───

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
  legalName?:    string;
  displayName?:  string;
  email?:        string | null;
  phone?:        string | null;
  website?:      string | null;
}

export interface UpdateOrganizationStatusDto {
  status: OrganizationStatus;
}

// ─── Pagination ────────────────────────────────────────────────────────────────

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

// ─── Error codes ─────────────────────────────────────────────────────────────

export const OrganizationErrorCode = {
  NOT_FOUND:            'ORG_NOT_FOUND',
  CODE_TAKEN:           'ORG_CODE_TAKEN',
  INDUSTRY_NOT_FOUND:   'ORG_INDUSTRY_NOT_FOUND',
  CANNOT_DELETE_ACTIVE: 'ORG_CANNOT_DELETE_ACTIVE',
} as const;

export type OrganizationErrorCode =
  (typeof OrganizationErrorCode)[keyof typeof OrganizationErrorCode];

// ─── Domain error ─────────────────────────────────────────────────────────────

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
