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
    description: 'Upload multiple PDF files',
    type: 'string',
    format: 'binary',
    isArray: true,
  })
  files: any[];
}
