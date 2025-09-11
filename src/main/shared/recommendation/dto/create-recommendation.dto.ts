import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRecommendationDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: true,
    description: 'Recommendation image file',
  })
 file?: Express.Multer.File;

  @ApiProperty({ description: 'Name of the recommendation', example: 'SENT Weekly' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Title of the recommendation', example: 'Education & Career' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Description of the recommendation', example: 'Education & Career description now' })
  @IsString()
  @IsNotEmpty()
  description: string;

}
