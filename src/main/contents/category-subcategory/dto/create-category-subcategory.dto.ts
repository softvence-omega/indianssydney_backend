import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Title of the content',
    example: 'How to Build with NestJS',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'the template of the category',
    example: 'string',
  })
  @IsString()
  @IsNotEmpty()
  tamplate: string;

  @ApiProperty({
    description: 'List of subcategories under this category',
    example: ['Industry & Finance', 'Politics', 'Education'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subnames?: string[];
}
