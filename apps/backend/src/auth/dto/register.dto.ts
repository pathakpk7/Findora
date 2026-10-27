import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(3)
  username!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  rollNo?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(6)
  year?: number;

  @IsOptional()
  @IsString()
  section?: string;
}
