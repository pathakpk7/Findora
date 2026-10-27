import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../config/prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { MatchingService } from './matching.service';
import { MatchingController } from './matching.controller';
import { GeminiMatchingProvider } from './providers/gemini-matching.provider';
import { RuleBasedMatchingProvider } from './providers/rule-based-matching.provider';

@Module({
  imports: [ConfigModule, PrismaModule, NotificationsModule],
  controllers: [MatchingController],
  providers: [
    MatchingService,
    GeminiMatchingProvider,
    RuleBasedMatchingProvider,
  ],
  exports: [MatchingService],
})
export class MatchingModule {}
