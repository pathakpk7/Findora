import { Module } from '@nestjs/common';
import { LostReportsController } from './lost-reports.controller';
import { LostReportsService } from './lost-reports.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [LostReportsController],
  providers: [LostReportsService],
  exports: [LostReportsService],
})
export class LostReportsModule {}
