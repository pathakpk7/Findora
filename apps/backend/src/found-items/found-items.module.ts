import { Module } from '@nestjs/common';
import { FoundItemsController } from './found-items.controller';
import { FoundItemsService } from './found-items.service';
import { PrismaModule } from '../config/prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditModule } from '../audit/audit.module';
import { ReputationModule } from '../reputation/reputation.module';

@Module({
  imports: [PrismaModule, NotificationsModule, AuditModule, ReputationModule],
  controllers: [FoundItemsController],
  providers: [FoundItemsService],
  exports: [FoundItemsService],
})
export class FoundItemsModule {}
