import { IsEnum, IsNotEmpty } from 'class-validator';
import { LostReportStatus } from '@prisma/client';

export class UpdateLostReportStatusDto {
  @IsNotEmpty()
  @IsEnum(LostReportStatus)
  status: LostReportStatus;
}
