import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class ManualAdjustDto {
  @IsString()
  @IsNotEmpty()
  targetUserId: string;

  @IsInt()
  @Min(-100)
  @Max(100)
  amount: number;

  @IsString()
  @IsNotEmpty()
  reason: string;
}
