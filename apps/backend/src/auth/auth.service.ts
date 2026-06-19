import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from '../config/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const prisma = this.prisma as any;
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: registerDto.email }, { username: registerDto.username }],
      },
    });

    if (existingUser) {
      throw new ConflictException('Email or username already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await prisma.user.create({
      data: {
        email: registerDto.email,
        username: registerDto.username,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        rollNo: registerDto.rollNo,
        department: registerDto.department,
        year: registerDto.year,
        section: registerDto.section,
        role: 'USER',
        trustScore: 0,
        isVerified: false,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        rollNo: true,
        department: true,
        year: true,
        section: true,
        trustScore: true,
        role: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return this.buildAuthResponse(user);
  }

  async login(loginDto: LoginDto) {
    const prisma = this.prisma as any;
    const user = await prisma.user.findUnique({
      where: { email: loginDto.email },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        firstName: true,
        lastName: true,
        avatar: true,
        rollNo: true,
        department: true,
        year: true,
        section: true,
        trustScore: true,
        role: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password, ...userWithoutPassword } = user;
    return this.buildAuthResponse(userWithoutPassword);
  }

  private buildAuthResponse(user: {
    id: string;
    email: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    avatar: string | null;
    rollNo: string | null;
    department: string | null;
    year: number | null;
    section: string | null;
    trustScore: number;
    role: string;
    isVerified: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      isVerified: user.isVerified,
    };

    return {
      user,
      token: this.jwtService.sign(payload),
      expiresIn: 60 * 60 * 24 * 7,
    };
  }
}
