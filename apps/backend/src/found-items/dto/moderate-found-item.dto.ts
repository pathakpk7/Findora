import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ModerateFoundItemDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
