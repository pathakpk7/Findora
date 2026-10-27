import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../config/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

jest.mock('bcrypt');

describe('AuthService (unit)', () => {
  let service: AuthService;
  let mockPrisma: any;
  let jwtService: Partial<JwtService>;

  beforeEach(async () => {
    mockPrisma = {
      user: {
        findFirst: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    jwtService = { sign: jest.fn().mockReturnValue('signed-token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.resetAllMocks());

  it('register should throw ConflictException when user exists', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({ id: '1' });
    await expect(
      service.register({
        email: 'a@b.com',
        username: 'u',
        password: 'pass',
      } as any)
    ).rejects.toThrow(ConflictException);
  });

  it('register should create user and return auth response', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
    const created = {
      id: '1',
      email: 'a@b.com',
      username: 'u',
      firstName: null,
      lastName: null,
      avatar: null,
      rollNo: null,
      department: null,
      year: null,
      section: null,
      trustScore: 0,
      role: 'USER',
      isVerified: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockPrisma.user.create.mockResolvedValue(created);

    const res = await service.register({
      email: 'a@b.com',
      username: 'u',
      password: 'pass',
    } as any);
    expect(res).toHaveProperty('user');
    expect(res).toHaveProperty('token', 'signed-token');
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: '1',
      email: 'a@b.com',
      username: 'u',
      role: 'USER',
      isVerified: false,
    });
  });

  it('login should throw when user not found', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    await expect(
      service.login({ email: 'x', password: 'p' } as any)
    ).rejects.toThrow(UnauthorizedException);
  });

  it('login should throw when password invalid', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: '1',
      password: 'hashed',
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    await expect(
      service.login({ email: 'x', password: 'p' } as any)
    ).rejects.toThrow(UnauthorizedException);
  });

  it('login should throw when user is deactivated', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: '1',
      password: 'hashed',
      isActive: false,
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    await expect(
      service.login({ email: 'x', password: 'p' } as any)
    ).rejects.toThrow(UnauthorizedException);
  });

  it('login should return auth response on success', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: '1',
      email: 'a@b.com',
      username: 'u',
      password: 'hashed',
      firstName: null,
      lastName: null,
      avatar: null,
      rollNo: '12345',
      department: 'CS',
      year: 3,
      section: 'A',
      trustScore: 10,
      role: 'USER',
      isVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const res = await service.login({ email: 'a@b.com', password: 'p' } as any);
    expect(res).toHaveProperty('user');
    expect(res).toHaveProperty('token', 'signed-token');
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: '1',
      email: 'a@b.com',
      username: 'u',
      role: 'USER',
      isVerified: true,
    });
  });
});
