import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateLiveEventDto } from './create-live-event.dto';
import { IsOptional } from 'class-validator';

export class UpdateLiveEventDto extends PartialType(CreateLiveEventDto) {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Thumbnail image file (optional)',
  })
  @IsOptional()
  thumbnail?: Express.Multer.File;
}
