import { IsBoolean } from 'class-validator';

export class UpdateUserVerifyDto {
  @IsBoolean()
  isVerified: boolean;
}
