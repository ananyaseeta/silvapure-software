import { RoleCode } from '@prisma/client';

export const ROLE_ADMIN                 = RoleCode.ADMIN;
export const ROLE_PLANT_MANAGER         = RoleCode.PLANT_MANAGER;
export const ROLE_ENVIRONMENTAL_OFFICER = RoleCode.ENVIRONMENTAL_OFFICER;
export const ROLE_OPERATOR              = RoleCode.OPERATOR;
export const ROLE_VIEWER                = RoleCode.VIEWER;

export const ALL_ROLE_CODES = [
  ROLE_ADMIN,
  ROLE_PLANT_MANAGER,
  ROLE_ENVIRONMENTAL_OFFICER,
  ROLE_OPERATOR,
  ROLE_VIEWER,
] as const;

export type KnownRoleCode = (typeof ALL_ROLE_CODES)[number];
