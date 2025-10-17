import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAiCategoryDto {
  @ApiProperty({ description: 'Category name', example: 'hello world' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ description: 'Subcategory name', example: 'make sure' })
  @IsString()
  @IsNotEmpty()
  subcategory: string;

  @ApiProperty({
    description: 'Title name',
    example: 'Upgrade Your Dropbox Plan',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Subtitle',
    example: 'Discover Dropbox premium features',
    required: false,
  })
  @IsOptional()
  @IsString()
  sub_title?: string;

  @ApiProperty({
    description: 'Main content text',
    example: 'Dropbox offers flexible storage plans...',
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;
}

// ------------- crate ai pragraph dto---------

export class CreateAiParagraphDto {
  @ApiProperty({
    description: 'Input paragraph provided by the user',
    example: 'make the world',
  })
  @IsOptional()
  @IsString()
  paragraph?: string;
}
