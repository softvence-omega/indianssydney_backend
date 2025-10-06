import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateAustraliaLawDto {
  @ApiProperty({
    description: 'Optional description for uploaded files',
    example: 'Legal documents related to property case',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description:
      'Upload multiple files only pdf file upload here , other files will be rejected',
    type: 'string',
    format: 'binary',
    isArray: true,

    required: true,
  })
  files?: Express.Multer.File[];
}
