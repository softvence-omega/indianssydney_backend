import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsOptional, IsString, IsUrl } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateLiveEventDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  subTitle: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Thumbnail image file',
  })
  @IsOptional()
  thumbnail?: Express.Multer.File;

  @ApiProperty({ type: [String], example: ['music', 'live'] })
  @IsArray()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return value.split(',').map((t) => t.trim());
    return [];
  })
  tags: string[];

  @ApiProperty()
  @IsDateString()
  startTime: Date;

  @ApiProperty()
  @IsDateString()
  endTime: Date;

  @ApiProperty({ description: 'YouTube live event URL' })
  @IsString()
  @IsUrl()
  youtubeLiveUrl: string;
}
