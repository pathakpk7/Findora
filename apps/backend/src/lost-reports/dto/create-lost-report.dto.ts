import {
  IsArray,
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ItemCategory } from '@prisma/client';

export class CreateLostReportDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @IsNotEmpty()
  @IsEnum(ItemCategory)
  category: ItemCategory;

  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  description: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  lostLocation: string;

  @IsNotEmpty()
  @IsISO8601()
  lostDate: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  identifyingCharacteristics?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
