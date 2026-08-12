import type { PrismaClient } from '@prisma/client';
import type { IPermissionRepository, Role } from '../types/authorization.types';

export class PermissionRepository implements IPermissionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findPermissionCodesByUserId(userId: string): Promise<ReadonlySet<string>> {
    const rows = await this.prisma.userRole.findMany({
      where: { userId },
      select: {
        role: {
          select: {
            rolePermissions: {
              select: {
                permission: { select: { code: true } },
              },
            },
          },
        },
      },
    });

    const codes = new Set<string>();
    for (const row of rows) {
      for (const rp of row.role.rolePermissions) {
        codes.add(rp.permission.code);
      }
    }
    return codes;
  }

  async findRolesByUserId(userId: string): Promise<Role[]> {
    const rows = await this.prisma.userRole.findMany({
      where: { userId },
      select: {
        role: { select: { id: true, code: true, name: true, description: true } },
      },
    });

    return rows.map((r) => ({
      id:          r.role.id,
      code:        r.role.code,
      name:        r.role.name,
      description: r.role.description,
    }));
  }
}
