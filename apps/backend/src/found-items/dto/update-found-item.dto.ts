import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ItemCategory } from '@prisma/client';

export class UpdateFoundItemDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  title?: string;

  @IsOptional()
  @IsEnum(ItemCategory)
  category?: ItemCategory;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  publicDescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  foundLocation?: string;

  @IsOptional()
  @IsDateString()
  foundDate?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  publicImages?: string[];

  // Private Verification Information
  @IsOptional()
  @IsString()
  @MaxLength(250)
  serialNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  hiddenMarks?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  privateIdentifyingInfo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  privateNotes?: string;
}
