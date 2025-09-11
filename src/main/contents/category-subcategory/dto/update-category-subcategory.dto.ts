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
    description: 'List of subcategories to add/update under this category',
    example: ['Industry & Finance', 'Politics', 'Education'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subnames?: string[];
}

export class UpdateSubcategoryDto {
  @ApiPropertyOptional({
    description: 'Name of the subcategory',
    example: 'Updated Industry & Finance',
  })
  @IsOptional()
  @IsString()
  subname?: string;
}
