import { ApiProperty } from '@nestjs/swagger';

export class CreateTestawDto {
  @ApiProperty({
    description: 'Title or name of the uploaded file',
    example: 'Profile Picture',
  })
  title: string;

  @ApiProperty({
    description: 'Optional description or note for the file',
    example: 'This is the main profile image.',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Image file to upload',
    type: 'string',
    format: 'binary',
  })
  file: any;
}
