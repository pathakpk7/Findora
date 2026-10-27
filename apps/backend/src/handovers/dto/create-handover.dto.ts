import { IsNotEmpty, IsString } from 'class-validator';

export class CreateHandoverDto {
  @IsNotEmpty()
  @IsString()
  claimId: string;
}
