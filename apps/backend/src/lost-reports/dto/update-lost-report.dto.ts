import { PartialType } from '@nestjs/mapped-types';
import { CreateLostReportDto } from './create-lost-report.dto';

export class UpdateLostReportDto extends PartialType(CreateLostReportDto) {}
