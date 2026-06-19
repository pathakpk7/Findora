import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check() {
    const dbHealthy = await this.prisma.isHealthy();
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: dbHealthy ? 'connected' : 'disconnected',
      version: '1.0.0',
    };
  }
}
