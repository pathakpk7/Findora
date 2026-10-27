import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateClaimDto {
  @IsNotEmpty()
  @IsString()
  foundItemId: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(10, { message: 'Evidence must be at least 10 characters long' })
  @MaxLength(2000, { message: 'Evidence cannot exceed 2000 characters' })
  evidence: string;
}
