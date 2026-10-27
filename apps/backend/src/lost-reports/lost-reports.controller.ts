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
import { LostReportsService } from './lost-reports.service';
import { CreateLostReportDto } from './dto/create-lost-report.dto';
import { UpdateLostReportDto } from './dto/update-lost-report.dto';
import { UpdateLostReportStatusDto } from './dto/update-lost-report-status.dto';
import { QueryLostReportsDto } from './dto/query-lost-reports.dto';

@Controller('lost-reports')
@UseGuards(JwtAuthGuard)
export class LostReportsController {
  constructor(private readonly lostReportsService: LostReportsService) {}

  @Post()
  async create(@Req() req: any, @Body() dto: CreateLostReportDto) {
    const report = await this.lostReportsService.create(req.user.id, dto);
    return {
      success: true,
      message: 'Lost Report registered successfully',
      data: report,
    };
  }

  @Get('my')
  async findMyReports(@Req() req: any, @Query() query: QueryLostReportsDto) {
    const result = await this.lostReportsService.findMyReports(
      req.user.id,
      query
    );
    return {
      success: true,
      ...result,
    };
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    const report = await this.lostReportsService.findOne(
      id,
      req.user.id,
      req.user.role
    );
    return {
      success: true,
      data: report,
    };
  }

  @Patch(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateLostReportDto
  ) {
    const updated = await this.lostReportsService.update(id, req.user.id, dto);
    return {
      success: true,
      message: 'Lost Report updated successfully',
      data: updated,
    };
  }

  @Patch(':id/status')
  async updateStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateLostReportStatusDto
  ) {
    const updated = await this.lostReportsService.updateStatus(
      id,
      req.user.id,
      req.user.role,
      dto.status
    );
    return {
      success: true,
      message: `Lost Report status updated to ${dto.status}`,
      data: updated,
    };
  }
}
