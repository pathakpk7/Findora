import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { FoundItemsService } from './found-items.service';
import { CreateFoundItemDto } from './dto/create-found-item.dto';
import { UpdateFoundItemDto } from './dto/update-found-item.dto';
import { QueryFoundItemsDto } from './dto/query-found-items.dto';
import { ModerateFoundItemDto } from './dto/moderate-found-item.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '@prisma/client';

@Controller('found-items')
export class FoundItemsController {
  constructor(private readonly foundItemsService: FoundItemsService) {}

  /**
   * Submit a new found item
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req: any, @Body() dto: CreateFoundItemDto) {
    return this.foundItemsService.create(req.user.id || req.user.sub, dto);
  }

  /**
   * Get public inventory of approved items
   */
  @Get()
  async findPublicItems(@Query() query: QueryFoundItemsDto) {
    return this.foundItemsService.findPublicItems(query);
  }

  /**
   * Get current user's submitted found items
   */
  @UseGuards(JwtAuthGuard)
  @Get('my')
  async findMyItems(@Request() req: any, @Query() query: QueryFoundItemsDto) {
    return this.foundItemsService.findMyItems(
      req.user.id || req.user.sub,
      query
    );
  }

  /**
   * Moderator: Get pending items queue
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MODERATOR, Role.ADMIN)
  @Get('moderation/pending')
  async findPendingItems(@Query() query: QueryFoundItemsDto) {
    return this.foundItemsService.findPendingItems(query);
  }

  /**
   * Moderator: Get moderation metrics stats
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MODERATOR, Role.ADMIN)
  @Get('moderation/stats')
  async getModerationStats() {
    return this.foundItemsService.getModerationStats();
  }

  /**
   * Moderator: Get item details with verification info for review
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MODERATOR, Role.ADMIN)
  @Get('moderation/:id')
  async findModeratorItemById(@Param('id') id: string) {
    return this.foundItemsService.findModeratorItemById(id);
  }

  /**
   * Moderator: Approve a pending item
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MODERATOR, Role.ADMIN)
  @Patch(':id/approve')
  async approve(@Request() req: any, @Param('id') id: string) {
    return this.foundItemsService.approve(id, req.user.id || req.user.sub);
  }

  /**
   * Moderator: Reject a pending item
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MODERATOR, Role.ADMIN)
  @Patch(':id/reject')
  async reject(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: ModerateFoundItemDto
  ) {
    return this.foundItemsService.reject(id, req.user.id || req.user.sub, dto);
  }

  /**
   * Get single public found item by ID
   */
  @Get(':id')
  async findPublicItemById(@Param('id') id: string) {
    return this.foundItemsService.findPublicItemById(id);
  }

  /**
   * Update user's own submitted item
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateFoundItemDto
  ) {
    return this.foundItemsService.update(id, req.user.id || req.user.sub, dto);
  }
}
