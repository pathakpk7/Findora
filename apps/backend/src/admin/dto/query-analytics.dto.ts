import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum AnalyticsPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
}

export class QueryAnalyticsDto {
  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @IsEnum(AnalyticsPeriod)
  period?: AnalyticsPeriod;
}
