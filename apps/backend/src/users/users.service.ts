import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../config/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    const prisma = this.prisma as any;

    return prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
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
  }

  async findOne(id: string) {
    const prisma = this.prisma as any;
    const user = await prisma.user.findUnique({
      where: { id },
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

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);
    const prisma = this.prisma as any;

    // Prevent users from updating role, trustScore, isVerified
    const { role, trustScore, isVerified, ...safeData } = updateUserDto as any;

    return prisma.user.update({
      where: { id },
      data: safeData,
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
  }
}
