import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateLiveEventDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  subTitle: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  thumbail?: string;

  @ApiProperty({ type: [String] })
  @IsArray()
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
