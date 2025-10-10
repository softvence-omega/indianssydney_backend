// create-total-page-view.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt } from 'class-validator';

export class CreateTotalPageViewDto {
  @ApiProperty({ description: 'Increment value', example: 1, required: false })
  @IsOptional()
  @IsInt()
  increment?: number;
}
