import { PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category-subcategory.dto';

// Instead of extending CreateSubcategoryDto (which has categoryId),
// make a clean DTO for updates without categoryId
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    description: 'Category name',
    example: 'Updated Finance',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Category description',
    example: 'Updated description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Optional new category icon file',
  })
  @IsOptional()
  file?: Express.Multer.File;
}
export class UpdateSubcategoryDto {
  @ApiPropertyOptional({
    description: 'Name of the subcategory',
    example: 'Updated Industry & Finance',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Description of the subcategory',
    example: 'Updated description',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
