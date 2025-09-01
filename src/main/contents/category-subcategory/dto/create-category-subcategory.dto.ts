import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Optional category icon file',
  })
  @IsOptional()
  file?: Express.Multer.File;

  @ApiProperty({
    description: 'Name of the category',
    example: 'News & Current Affairs',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Description of the category',
    example: 'Education & Career description now',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}

export class CreateSubcategoryDto {
  @ApiProperty({
    description: 'Name of the subcategory',
    example: 'Industry & Finance',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Description of the subcategory',
    example: 'Subcategory description goes here',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Parent Category ID',
    example: 'uuid-of-category',
  })
  @IsString()
  @IsNotEmpty()
  categoryId: string;
}
