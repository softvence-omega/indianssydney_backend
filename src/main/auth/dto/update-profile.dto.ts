import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Profile photo file',
    required: false,
  })
  @IsOptional()
  file?: Express.Multer.File;

  @ApiProperty({
    example: 'This is my bio',
    description: 'User bio or description',
    required: false,
  })
  @IsOptional()
  @IsString()
  bio?: string;
}
