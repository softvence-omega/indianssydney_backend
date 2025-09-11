import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateReportDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    isArray: true,
  })
  files?: Express.Multer.File[];

  @ApiProperty({
    example: 'The news page of the article',
    required: true,
  })
  @IsString()
  contentTitle: string;

  @ApiProperty({
    example: 'This is fake article with copyright issues',
    required: true,
  })
  @IsString()
  reason: string;
}
