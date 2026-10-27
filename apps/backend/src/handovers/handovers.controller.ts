import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HandoversService } from './handovers.service';
import { CreateHandoverDto } from './dto/create-handover.dto';
import { ScanHandoverDto } from './dto/scan-handover.dto';

@Controller('handovers')
@UseGuards(JwtAuthGuard)
export class HandoversController {
  constructor(private readonly handoversService: HandoversService) {}

  @Post()
  async create(@Req() req: any, @Body() dto: CreateHandoverDto) {
    const data = await this.handoversService.create(
      req.user.id,
      req.user.role,
      dto
    );
    return {
      success: true,
      message: 'Handover token and QR session created successfully',
      data,
    };
  }

  @Get('my')
  async findMyHandovers(@Req() req: any) {
    const data = await this.handoversService.findMyHandovers(req.user.id);
    return {
      success: true,
      data,
    };
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    const data = await this.handoversService.findOne(
      id,
      req.user.id,
      req.user.role
    );
    return {
      success: true,
      data,
    };
  }

  @Post('scan')
  async scanAndComplete(@Req() req: any, @Body() dto: ScanHandoverDto) {
    const data = await this.handoversService.scanAndComplete(
      req.user.id,
      req.user.role,
      dto
    );
    return {
      success: true,
      message: 'Handover confirmed and item marked as RETURNED',
      data,
    };
  }

  @Patch(':id/cancel')
  async cancel(@Req() req: any, @Param('id') id: string) {
    const data = await this.handoversService.cancel(
      id,
      req.user.id,
      req.user.role
    );
    return {
      success: true,
      message: 'Handover session cancelled',
      data,
    };
  }
}
