# SILVAPURE — Seed Architecture

## Overview

The seed system populates the SILVAPURE PostgreSQL database with required
reference data before any application code runs. It is **idempotent** —
running it multiple times produces the same result with no duplicate records.

No demo organizations, mock users, or test data are created. This seed is
safe to run in production.

---

## Entry Point

```
prisma/seed.ts
```

Invoked by Prisma CLI via the `seed` script in `package.json`:

```bash
npx prisma db seed
```

Or during a fresh migration:

```bash
npx prisma migrate dev
```

---

## Directory Structure

```
prisma/
├── seed.ts                          # Orchestrator entry point
└── seed/
    ├── data/                        # Pure data — no Prisma calls
    │   ├── roles.ts                 # Role definitions (RoleCode enum values)
    │   ├── permissions.ts           # All 81 permission codes from RBAC spec
    │   └── rolePermissionMappings.ts # Role ↔ Permission matrix from RBAC spec
    │
    ├── seeders/                     # Prisma write operations
    │   ├── roles.seed.ts            # Upserts all roles
    │   ├── permissions.seed.ts      # Upserts all permissions
    │   └── rolePermissions.seed.ts  # Upserts role-permission junction rows
    │
    └── utils/                       # Shared infrastructure
        ├── logger.ts                # Structured console logger
        ├── upsert.ts                # Generic idempotent upsert helpers
        └── transaction.ts           # prisma.$transaction wrapper
```

---

## Execution Order

Roles and permissions have no dependencies on each other and are seeded
in parallel. Role-permission mappings depend on both and run after.

```
seedRoles()       ──┐
                    ├── parallel ──> seedRolePermissions()
seedPermissions() ──┘
```

---

## Idempotency

Every write uses `prisma.X.upsert()` keyed on the stable business key:

| Model          | Upsert key             |
|----------------|------------------------|
| Role           | `code` (RoleCode enum) |
| Permission     | `code` (string)        |
| RolePermission | `roleId + permissionId` (composite) |

Running the seed twice in a row is a no-op — no records are duplicated or
overwritten with different data.

---

## Transactions

Each seeder wraps all its upserts in a single `prisma.$transaction()` via
`runInTransaction()` in `utils/transaction.ts`.

- If any upsert within a seeder fails, the **entire seeder rolls back**.
- Failures in one seeder do not affect other seeders.
- Exit code `1` is returned on any failure so CI pipelines and migration
  scripts detect the error.

---

## RBAC Specification Mapping

The RBAC spec defines **7 role columns**. The `schema.prisma` `RoleCode`
enum contains **5 values**. The mapping is:

| RBAC Spec Column       | RoleCode in Schema  | Notes                                              |
|------------------------|---------------------|----------------------------------------------------|
| Platform Admin         | `ADMIN`             |                                                    |
| Organization Admin     | `ADMIN`             | Scoped at API layer via org ownership              |
| Plant Manager          | `PLANT_MANAGER`     |                                                    |
| Environmental Officer  | `ENVIRONMENTAL_OFFICER` |                                                |
| Maintenance Engineer   | `OPERATOR`          | Union of Maintenance Engineer + Plant Operator     |
| Plant Operator         | `OPERATOR`          |                                                    |
| Viewer / Auditor       | `VIEWER`            |                                                    |

The `OPERATOR` role receives the **union** of permissions from both the
Maintenance Engineer and Plant Operator columns. When a dedicated
`MAINTENANCE_ENGINEER` RoleCode is added to the schema in a future phase,
the mapping in `rolePermissionMappings.ts` must be split accordingly.

---

## Permission Categories

The `module` field on each `Permission` record is derived automatically
from the permission code prefix (everything before the first `.`):

```
auth.login                → module: "auth"
ai.approve_recommendation → module: "ai"
treatment_plant.delete    → module: "treatment_plant"
```

This is handled in `data/permissions.ts` by the `deriveModule()` function.
No manual category assignment is needed.

---

## Permissions Summary (81 total)

| Module              | Count |
|---------------------|-------|
| auth                | 4     |
| user                | 8     |
| organization        | 6     |
| plant               | 5     |
| treatment_plant     | 4     |
| controller          | 4     |
| device              | 6     |
| sensor              | 5     |
| telemetry           | 3     |
| alert               | 4     |
| maintenance         | 5     |
| compliance          | 5     |
| report              | 5     |
| passport            | 4     |
| ai                  | 8     |
| rule                | 4     |
| notification        | 3     |
| audit               | 2     |
| subscription        | 2     |
| module              | 2     |
| plan                | 2     |

---

## Adding New Permissions

1. Add the permission to `data/permissions.ts` — follow the `code.action`
   naming convention.
2. Add the relevant role grants to `data/rolePermissionMappings.ts`.
3. Run `npx prisma db seed` — the new rows will be upserted safely.

## Adding New Roles

1. Add the new value to the `RoleCode` enum in `schema.prisma`.
2. Run `npx prisma migrate dev` to apply the schema change.
3. Add the role to `data/roles.ts`.
4. Add the role's permission grants to `data/rolePermissionMappings.ts`.
5. Run `npx prisma db seed`.

---

## Running the Seed

```bash
# Full reset + seed (development only)
npx prisma migrate reset

# Seed only (safe for production)
npx prisma db seed

# Verify the schema is valid before seeding
npx prisma validate && npx prisma generate && npx prisma db seed
```
