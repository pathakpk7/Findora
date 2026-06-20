import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    console.log('[PRISMA] onModuleInit() called, connecting to database...');
    await this.$connect();
    console.log('[PRISMA] Database connected successfully');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
