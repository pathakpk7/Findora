import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ClaimStatus } from '@prisma/client';

export class ReviewClaimDto {
  @IsNotEmpty()
  @IsEnum(ClaimStatus)
  status: ClaimStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reviewReason?: string;
}
