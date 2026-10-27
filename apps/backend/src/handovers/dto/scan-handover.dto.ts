import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ScanHandoverDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(10, { message: 'Handover token is too short' })
  @MaxLength(100, { message: 'Handover token is too long' })
  token: string;
}
