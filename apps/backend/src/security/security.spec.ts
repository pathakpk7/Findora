import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from '../auth/jwt.strategy';
import { RolesGuard } from '../auth/roles/roles.guard';
import { PrismaService } from '../config/prisma/prisma.service';
import { Role } from '@prisma/client';
import { Reflector } from '@nestjs/core';

describe('Phase 14 Comprehensive Security Hardening Suite', () => {
  describe('1. Authentication & Account Deactivation Security', () => {
    let strategy: JwtStrategy;
    let mockPrisma: any;

    beforeEach(async () => {
      mockPrisma = {
        user: {
          findUnique: jest.fn(),
        },
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          JwtStrategy,
          { provide: PrismaService, useValue: mockPrisma },
        ],
      }).compile();

      strategy = module.get<JwtStrategy>(JwtStrategy);
    });

    it('rejects access for deactivated user accounts', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-deactivated-1',
        email: 'deactivated@college.edu',
        role: Role.USER,
        isActive: false,
      });

      await expect(
        strategy.validate({ sub: 'user-deactivated-1' })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('validates active user accounts successfully', async () => {
      const activeUser = {
        id: 'user-active-1',
        email: 'student@college.edu',
        role: Role.USER,
        isActive: true,
      };
      mockPrisma.user.findUnique.mockResolvedValue(activeUser);

      const result = await strategy.validate({ sub: 'user-active-1' });
      expect(result).toEqual(activeUser);
    });
  });

  describe('2. RBAC Guard Enforcement', () => {
    let guard: RolesGuard;
    let reflector: Reflector;

    beforeEach(() => {
      reflector = new Reflector();
      guard = new RolesGuard(reflector);
    });

    it('blocks USER role from ADMIN resources', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);

      const mockContext = {
        getHandler: () => {},
        getClass: () => {},
        switchToHttp: () => ({
          getRequest: () => ({
            user: { id: 'u1', role: Role.USER },
          }),
        }),
      } as any;

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });

    it('blocks MODERATOR role from ADMIN resources', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);

      const mockContext = {
        getHandler: () => {},
        getClass: () => {},
        switchToHttp: () => ({
          getRequest: () => ({
            user: { id: 'm1', role: Role.MODERATOR },
          }),
        }),
      } as any;

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });

    it('allows ADMIN role access to ADMIN resources', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);

      const mockContext = {
        getHandler: () => {},
        getClass: () => {},
        switchToHttp: () => ({
          getRequest: () => ({
            user: { id: 'a1', role: Role.ADMIN },
          }),
        }),
      } as any;

      expect(guard.canActivate(mockContext)).toBe(true);
    });
  });
});
