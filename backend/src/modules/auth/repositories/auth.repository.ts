import type { PrismaClient } from '@prisma/client';
import type { AuthUserRecord } from '../types/auth.types';

export class AuthRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findUserByEmail(email: string): Promise<AuthUserRecord | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id:             true,
        email:          true,
        passwordHash:   true,
        organizationId: true,
        status:         true,
        firstName:      true,
        lastName:       true,
      },
    });
  }

  async findUserById(id: string): Promise<AuthUserRecord | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id:             true,
        email:          true,
        passwordHash:   true,
        organizationId: true,
        status:         true,
        firstName:      true,
        lastName:       true,
      },
    });
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data:  { passwordHash },
    });
  }
}
