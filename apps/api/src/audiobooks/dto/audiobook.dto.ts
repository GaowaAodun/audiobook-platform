import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  AccessType,
  AgeRating,
  ContentType,
  Language,
} from '../../../generated/prisma';

export class CreateAudiobookDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty()
  @IsString()
  author: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  narrator?: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coverUrl?: string;

  @ApiProperty()
  @IsString()
  categoryId: string;

  @ApiProperty({ enum: Language })
  @IsEnum(Language)
  language: Language;

  @ApiPropertyOptional({ enum: ContentType, default: ContentType.AUDIOBOOK })
  @IsOptional()
  @IsEnum(ContentType)
  contentType: ContentType = ContentType.AUDIOBOOK;

  @ApiPropertyOptional({ enum: AccessType, default: AccessType.SUBSCRIPTION })
  @IsOptional()
  @IsEnum(AccessType)
  accessType: AccessType = AccessType.SUBSCRIPTION;

  @ApiPropertyOptional({ enum: AgeRating, default: AgeRating.ADULT })
  @IsOptional()
  @IsEnum(AgeRating)
  ageRating: AgeRating = AgeRating.ADULT;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  originalPrice: number = 0;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  memberPrice: number = 0;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];
}

export class UpdateAudiobookDto extends PartialType(CreateAudiobookDto) {}

export class CreateChapterDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  order: number;

  @ApiProperty({ description: 'Duration in seconds' })
  @IsInt()
  @Min(0)
  duration: number;

  @ApiProperty()
  @IsString()
  audioKey: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  textContent?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isFree: boolean = false;
}

export class UpdateChapterDto extends PartialType(CreateChapterDto) {}

export class AudiobookQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ enum: Language })
  @IsOptional()
  @IsEnum(Language)
  language?: Language;

  @ApiPropertyOptional({ enum: AccessType })
  @IsOptional()
  @IsEnum(AccessType)
  accessType?: AccessType;

  @ApiPropertyOptional({ enum: AgeRating })
  @IsOptional()
  @IsEnum(AgeRating)
  ageRating?: AgeRating;

  @ApiPropertyOptional({ enum: ContentType })
  @IsOptional()
  @IsEnum(ContentType)
  contentType?: ContentType;

  @ApiPropertyOptional({ description: 'Search by title or author' })
  @IsOptional()
  @IsString()
  search?: string;
}
