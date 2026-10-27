import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class QueryMatchesDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  minScore?: number = 0;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  forceRefresh?: boolean = false;
}
