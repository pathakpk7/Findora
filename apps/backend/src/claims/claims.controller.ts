import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { ClaimsService } from './claims.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';
import { ReviewClaimDto } from './dto/review-claim.dto';
import { QueryClaimsDto } from './dto/query-claims.dto';
import { Role } from '@prisma/client';

@Controller('claims')
@UseGuards(JwtAuthGuard)
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  @Post()
  async create(@Req() req: any, @Body() dto: CreateClaimDto) {
    const claim = await this.claimsService.create(req.user.id, dto);
    return {
      success: true,
      message: 'Claim submitted successfully',
      data: claim,
    };
  }

  @Get('my')
  async findMyClaims(@Req() req: any, @Query() query: QueryClaimsDto) {
    const result = await this.claimsService.findMyClaims(req.user.id, query);
    return {
      success: true,
      ...result,
    };
  }

  @Get('moderation/pending')
  @UseGuards(RolesGuard)
  @Roles(Role.MODERATOR, Role.ADMIN)
  async findPendingModeration(@Query() query: QueryClaimsDto) {
    const result = await this.claimsService.findPendingModeration(query);
    return {
      success: true,
      ...result,
    };
  }

  @Get('moderation/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.MODERATOR, Role.ADMIN)
  async findModerationDetail(@Param('id') id: string) {
    const claim = await this.claimsService.findModerationDetail(id);
    return {
      success: true,
      data: claim,
    };
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    const claim = await this.claimsService.findOne(
      id,
      req.user.id,
      req.user.role
    );
    return {
      success: true,
      data: claim,
    };
  }

  @Patch(':id')
  async updateEvidence(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateClaimDto
  ) {
    const updated = await this.claimsService.updateEvidence(
      id,
      req.user.id,
      dto
    );
    return {
      success: true,
      message: 'Claim evidence updated successfully',
      data: updated,
    };
  }

  @Patch(':id/cancel')
  async cancel(@Req() req: any, @Param('id') id: string) {
    const cancelled = await this.claimsService.cancel(id, req.user.id);
    return {
      success: true,
      message: 'Claim cancelled successfully',
      data: cancelled,
    };
  }

  @Patch(':id/review')
  @UseGuards(RolesGuard)
  @Roles(Role.MODERATOR, Role.ADMIN)
  async reviewClaim(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: ReviewClaimDto
  ) {
    const reviewed = await this.claimsService.reviewClaim(
      id,
      req.user.id,
      req.user.role,
      dto
    );
    return {
      success: true,
      message: `Claim review complete (${dto.status})`,
      data: reviewed,
    };
  }
}
