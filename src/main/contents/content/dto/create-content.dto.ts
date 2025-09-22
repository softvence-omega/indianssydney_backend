// dtos/create-content.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsEnum, IsArray } from 'class-validator';
import { ContentType } from '@prisma/client';
import { Transform } from 'class-transformer';
import { AdditionalFieldDto } from './additional-field.dto';

export class CreateContentDto {
  @ApiProperty({
    description: 'Title of the content',
    example: 'How to Build with NestJS',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'YouTube video URL of the content',
    example: 'https://youtu.be/k-WikFJvi6M?si=etS-bgr7a3EPPuyB',
  })
  @IsOptional()
  @IsString()
  youtubeVideoUrl?: string;

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

  @ApiPropertyOptional({
    description: 'Tags for the content',
    example: ['React', 'JavaScript', 'NestJS'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value.split(',').map((v: string) => v.trim());
      }
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

  @ApiPropertyOptional({
    description: 'Upload a main image',
    type: 'string',
    format: 'binary',
    example: 'main.jpg',
  })
  @IsOptional()
  image?: Express.Multer.File;

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
  video?: Express.Multer.File;

  @ApiPropertyOptional({
    description: 'Upload a main audio file',
    type: 'string',
    format: 'binary',
    example: 'background.mp3',
  })
  @IsOptional()
  audio?: Express.Multer.File;

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

  // @ApiProperty({
  //   description: 'User ID (UUID)',
  //   example: 'a1b2c3d4-5678-90ab-cdef-1234567890ab',
  // })
  // @IsUUID()
  // userId: string;

  @ApiPropertyOptional({
    description:
      'Array of additional fields (paragraphs, images, quotes, audio, video)',
    type: [AdditionalFieldDto],
  })
  @IsOptional()
  @IsArray()
  additionalFields?: AdditionalFieldDto[];
}
