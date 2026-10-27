import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MatchingService } from './matching.service';
import { QueryMatchesDto } from './dto/query-matches.dto';
import { Role } from '@prisma/client';

@ApiTags('Matching')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('lost-reports')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get(':id/matches')
  @ApiOperation({
    summary: 'Get AI-assisted candidate matches for a Lost Report',
  })
  async getMatches(
    @Param('id') id: string,
    @Request() req: any,
    @Query() query: QueryMatchesDto
  ) {
    return this.matchingService.findMatchesForLostReport(
      id,
      req.user.id,
      req.user.role as Role,
      { ...query, forceRefresh: false }
    );
  }

  @Post(':id/matches/refresh')
  @ApiOperation({
    summary: 'Force recompute AI-assisted candidate matches for a Lost Report',
  })
  async refreshMatches(
    @Param('id') id: string,
    @Request() req: any,
    @Query() query: QueryMatchesDto
  ) {
    return this.matchingService.findMatchesForLostReport(
      id,
      req.user.id,
      req.user.role as Role,
      { ...query, forceRefresh: true }
    );
  }
}
