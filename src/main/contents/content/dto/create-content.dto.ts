import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsEnum, IsArray } from 'class-validator';

import { ContentType } from '@prisma/client';
import { Transform } from 'class-transformer';

// ---------------- Additional Field DTO ----------------
export class AdditionalFieldDto {}

// ---------------- Main Content DTO ----------------
export class CreateContentDto {
  @ApiProperty({
    description: 'Title of the content',
    example: 'How to Build with NestJS',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Subtitle of the content',
    example: 'A complete beginner guide',
  })
  @IsString()
  subTitle: string;

  @ApiPropertyOptional({
    description: 'Main paragraph text',
    example: 'This post explains how to build scalable apps...',
  })
  @IsOptional()
  @IsString()
  paragraph?: string;

  @ApiPropertyOptional({
    description: 'Short quote for highlight',
    example: 'Code once, scale forever.',
  })
  @IsOptional()
  @IsString()
  shortQuote?: string;

  @ApiPropertyOptional({
    description: 'Caption for the main image',
    example: 'NestJS Logo with background',
  })
  @IsOptional()
  @IsString()
  imageCaption?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((v) => v.trim());
    }
    return value;
  })
  tags?: string[];
  @ApiProperty({
    description: 'Type of content',
    enum: ContentType,
    example: ContentType.ARTICLE,
  })
  @IsEnum(ContentType)
  contentType: ContentType;

  // -------- File Uploads ----------
  @ApiPropertyOptional({
    description: 'Upload a main image',
    type: 'string',
    format: 'binary',
    example: 'main.jpg',
  })
  @IsOptional()
  mainImage?: Express.Multer.File;

  @ApiPropertyOptional({
    description: 'Upload a video thumbnail',
    type: 'string',
    format: 'binary',
    example: 'video-thumbnail.jpg',
  })
  @IsOptional()
  videoThumbnail?: Express.Multer.File;

  @ApiPropertyOptional({
    description: 'Upload a video file',
    type: 'string',
    format: 'binary',
    example: 'intro.mp4',
  })
  @IsOptional()
  videoFile?: Express.Multer.File;

  @ApiPropertyOptional({
    description: 'Upload a main audio file',
    type: 'string',
    format: 'binary',
    example: 'background.mp3',
  })
  @IsOptional()
  audioFile?: Express.Multer.File;

  // -------- Relations ----------
  @ApiProperty({
    description: 'Category ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  categoryId: string;

  @ApiProperty({
    description: 'SubCategory ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  subCategoryId: string;

  // -------- Nested Additional Fields ----------
  //   @ApiPropertyOptional({
  //     description: 'Additional multimedia & texts',
  //     type: () => AdditionalFieldDto,
  //   })
  //   @IsOptional()
  //   additionalFields?: AdditionalFieldDto;

  @ApiPropertyOptional({
    description: 'Upload multiple images',
    type: 'array',
    items: { type: 'string', format: 'binary' },
    example: ['image1.jpg', 'image2.png'],
  })
  @IsOptional()
  additionalImages?: Express.Multer.File[];

  @ApiPropertyOptional({
    description: 'Upload multiple audio files',
    type: 'array',
    items: { type: 'string', format: 'binary' },
    example: ['audio1.mp3', 'audio2.wav'],
  })
  @IsOptional()
  additionalAudios?: Express.Multer.File[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split('|').map((v) => v.trim());
    }
    return value;
  })
  additionalQuotes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split('|').map((v) => v.trim());
    }
    return value;
  })
  additionalParagraphs?: string[];

  @ApiPropertyOptional({
    description: 'Upload multiple thumbnail images',
    type: 'array',
    items: { type: 'string', format: 'binary' },
    example: ['thumb1.jpg', 'thumb2.png'],
  })
  @IsOptional()
  additionalThumbnails?: Express.Multer.File[];
}
