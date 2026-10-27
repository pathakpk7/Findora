import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '@prisma/client';
import { ReputationService } from './reputation.service';
import { ManualAdjustDto } from './dto/manual-adjust.dto';

@Controller('reputation')
export class ReputationController {
  constructor(private readonly reputationService: ReputationService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyReputation(@Req() req: any) {
    const data = await this.reputationService.getUserReputation(req.user.id);
    return {
      success: true,
      data,
    };
  }

  @Get('leaderboard')
  async getLeaderboard(
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    const result = await this.reputationService.getLeaderboard(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20
    );

    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
    };
  }

  @Post('adjust')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MODERATOR, Role.ADMIN)
  async manualAdjust(@Req() req: any, @Body() dto: ManualAdjustDto) {
    const data = await this.reputationService.manualAdjust(
      dto.targetUserId,
      dto.amount,
      dto.reason,
      req.user.id
    );

    return {
      success: true,
      message: 'Trust score adjusted successfully',
      data,
    };
  }
}
