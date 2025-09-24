import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    description: 'Category name',
    example: 'Updated Finance',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Template name of the category',
    example: 'new-template',
  })
  @IsOptional()
  @IsString()
  tamplate?: string;

  @ApiPropertyOptional({
    description: 'List of subcategories to update/add under this category',
    example: ['Industry & Finance', 'Politics', 'Education'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subnames?: string[];
}
