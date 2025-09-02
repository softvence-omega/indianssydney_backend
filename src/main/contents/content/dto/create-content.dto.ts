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
    example: 'b014564b-4712-4832-b600-8fe33f8d5b40',
  })
  @IsUUID()
  categoryId: string;

  @ApiProperty({
    description: 'SubCategory ID (UUID)',
    example: '304032b0-dc03-4e77-a2e3-3b5b37eeafac',
  })
  @IsUUID()
  subCategoryId: string;

  // -------- Additional Fields ----------

  @ApiPropertyOptional({
    description: 'Upload a main image',
    type: 'string',
    format: 'binary',
    example: 'main.jpg',
  })
  @IsOptional()
  additionalImages?: Express.Multer.File[];

  @ApiPropertyOptional({
    description: 'Upload a addtional audio file',
    type: 'string',
    format: 'binary',
    example: 'background.mp3',
  })
  @IsOptional()
  additionalAudios?: Express.Multer.File[];

  @ApiPropertyOptional({
    description: 'Short quote for highlight',
    example: 'Code once, scale forever.',
  })
  @IsOptional()
  @IsString()
  additionalQuotes?: string;


  @ApiPropertyOptional({
    description: 'Main paragraph text',
    example: 'This post explains how to build scalable apps...',
  })
  @IsOptional()
  @IsString()
  additionalParagraphs?: string;

  @ApiPropertyOptional({
    description: 'Upload multiple thumbnail images',
    type: 'array',
    items: { type: 'string', format: 'binary' },
    example: ['thumb1.jpg', 'thumb2.png'],
  })
  @IsOptional()
  additionalThumbnails?: Express.Multer.File[];
}
