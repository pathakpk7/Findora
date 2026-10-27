import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../config/prisma/prisma.service';
import { AuditAction } from '@prisma/client';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  async logAction(
    action: AuditAction,
    entityType: string,
    entityId: string,
    actorId?: string,
    metadata?: Record<string, any>
  ) {
    try {
      return await this.prisma.auditLog.create({
        data: {
          action,
          entityType,
          entityId,
          actorId: actorId || null,
          metadata: metadata ? JSON.stringify(metadata) : null,
        },
      });
    } catch (error: any) {
      this.logger.error(
        `Failed to record audit log for ${action} on ${entityType}:${entityId}: ${error.message || error}`
      );
    }
  }
}
