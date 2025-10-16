import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

//upload file dto
export class UploadS3AdditionalFileDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  file?: Express.Multer.File;
}
