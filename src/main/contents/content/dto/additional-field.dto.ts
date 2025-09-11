// dtos/additional-field.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';

enum AdditionalFieldType {
  PARAGRAPH = 'paragraph',
  IMAGE = 'image',
  QUOTE = 'quote',
  AUDIO = 'audio',
  VIDEO = 'video',
}

export class AdditionalFieldDto {
  @ApiProperty({
    description: 'Type of the additional field',
    enum: AdditionalFieldType,
    example: AdditionalFieldType.PARAGRAPH,
  })
  @IsEnum(AdditionalFieldType)
  type: AdditionalFieldType;

  @ApiPropertyOptional({
    description:
      'Value of the additional field (text or file name for images, audio, or video)',
    example: 'This is an additional paragraph text or file path',
  })
  @IsOptional()
  @IsString()
  value?: string;

  @ApiPropertyOptional({
    description:
      'File for additional field (e.g., image, audio, or video file)',
    type: 'string',
    format: 'binary',
    example: 'additional-image.jpg',
  })
  @IsOptional()
  file?: Express.Multer.File;

  @ApiProperty({
    description: 'Timestamp to maintain order of additional fields',
    example: '1756864974298',
  })
  @IsString()
  timestamp: string;
}
