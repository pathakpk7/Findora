import { Module } from '@nestjs/common';
import { HandoversController } from './handovers.controller';
import { HandoversService } from './handovers.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditModule } from '../audit/audit.module';
import { ReputationModule } from '../reputation/reputation.module';

@Module({
  imports: [NotificationsModule, AuditModule, ReputationModule],
  controllers: [HandoversController],
  providers: [HandoversService],
  exports: [HandoversService],
})
export class HandoversModule {}
