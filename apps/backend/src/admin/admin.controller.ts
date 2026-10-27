import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '@prisma/client';
import { AdminService } from './admin.service';
import { QueryAnalyticsDto } from './dto/query-analytics.dto';
import { QueryAdminUsersDto } from './dto/query-admin-users.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UpdateUserVerifyDto } from './dto/update-user-verify.dto';
import { QueryAuditLogsDto } from './dto/query-audit-logs.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('analytics/overview')
  async getOverviewAnalytics(@Query() query: QueryAnalyticsDto) {
    const data = await this.adminService.getOverviewAnalytics(query);
    return {
      success: true,
      data,
    };
  }

  @Get('analytics/trends')
  async getTrendAnalytics(@Query() query: QueryAnalyticsDto) {
    const data = await this.adminService.getTrendAnalytics(query);
    return {
      success: true,
      data,
    };
  }

  @Get('analytics/users')
  async getUserAnalytics() {
    const data = await this.adminService.getUserAnalytics();
    return {
      success: true,
      data,
    };
  }

  @Get('analytics/items')
  async getItemAnalytics() {
    const data = await this.adminService.getItemAnalytics();
    return {
      success: true,
      data,
    };
  }

  @Get('analytics/claims')
  async getClaimAnalytics() {
    const data = await this.adminService.getClaimAnalytics();
    return {
      success: true,
      data,
    };
  }

  @Get('users')
  async getUsers(@Query() query: QueryAdminUsersDto) {
    const result = await this.adminService.getUsers(query);
    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
    };
  }

  @Patch('users/:id/role')
  async updateUserRole(
    @Req() req: any,
    @Param('id') targetUserId: string,
    @Body() dto: UpdateUserRoleDto
  ) {
    const data = await this.adminService.updateUserRole(
      targetUserId,
      dto.role,
      req.user.id
    );
    return {
      success: true,
      message: `User role updated to ${dto.role}`,
      data,
    };
  }

  @Patch('users/:id/verify')
  async updateUserVerify(
    @Req() req: any,
    @Param('id') targetUserId: string,
    @Body() dto: UpdateUserVerifyDto
  ) {
    const data = await this.adminService.updateUserVerify(
      targetUserId,
      dto.isVerified,
      req.user.id
    );
    return {
      success: true,
      message: `User verification updated to ${dto.isVerified}`,
      data,
    };
  }

  @Patch('users/:id/status')
  async updateUserStatus(
    @Req() req: any,
    @Param('id') targetUserId: string,
    @Body() dto: UpdateUserStatusDto
  ) {
    const data = await this.adminService.updateUserStatus(
      targetUserId,
      dto.isActive,
      dto.reason,
      req.user.id
    );
    return {
      success: true,
      message: `User status updated to ${dto.isActive ? 'active' : 'deactivated'}`,
      data,
    };
  }

  @Get('audit-logs')
  async getAuditLogs(@Query() query: QueryAuditLogsDto) {
    const result = await this.adminService.getAuditLogs(query);
    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
    };
  }
}
