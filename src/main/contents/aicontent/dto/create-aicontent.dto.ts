import { ApiProperty } from '@nestjs/swagger';
import {

  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';


 export class CreateAiCategoryDto {
  @ApiProperty({ description: 'Category name', example: 'hello world' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ description: 'Subcategory name', example: 'make sure' })
  @IsString()
  @IsNotEmpty()
  subcategory: string;

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

