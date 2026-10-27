import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { PrismaModule } from './config/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HealthModule } from './health/health.module';
import { CloudinaryModule } from './config/cloudinary/cloudinary.module';
import { FoundItemsModule } from './found-items/found-items.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditModule } from './audit/audit.module';
import { LostReportsModule } from './lost-reports/lost-reports.module';
import { ClaimsModule } from './claims/claims.module';
import { HandoversModule } from './handovers/handovers.module';
import { ReputationModule } from './reputation/reputation.module';
import { AdminModule } from './admin/admin.module';
import { MatchingModule } from './matching/matching.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, '..', '..', '..', '.env'),
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    HealthModule,
    CloudinaryModule,
    FoundItemsModule,
    NotificationsModule,
    AuditModule,
    LostReportsModule,
    ClaimsModule,
    HandoversModule,
    ReputationModule,
    AdminModule,
    MatchingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor() {
    console.log('[APP_MODULE] AppModule constructor called');
  }
}
