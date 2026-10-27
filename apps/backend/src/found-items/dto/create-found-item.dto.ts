import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ItemCategory } from '@prisma/client';

export class CreateFoundItemDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  title: string;

  @IsNotEmpty()
  @IsEnum(ItemCategory)
  category: ItemCategory;

  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  publicDescription: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(250)
  foundLocation: string;

  @IsNotEmpty()
  @IsDateString()
  foundDate: string;

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
