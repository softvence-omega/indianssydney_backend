import { PartialType } from '@nestjs/swagger';

import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCommunityDto {
  @ApiProperty({
    description: 'The description/content of the community post',
    example: 'Updated post content',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Optional updated community post image file',
    required: false,
  })
  @IsOptional()
  file?: Express.Multer.File;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Optional updated community post video file',
    required: false,
  })
  @IsOptional()
  video?: Express.Multer.File;
}
