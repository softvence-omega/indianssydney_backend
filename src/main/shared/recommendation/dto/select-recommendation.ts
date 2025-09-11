import { ApiProperty } from "@nestjs/swagger";
import {  IsString } from "class-validator";

export class UseSelectRecommendationDto {
  @ApiProperty({
    description: 'Recommendation ID to assign',
    example: 'rec_123',
  })
  @IsString()
  recommendationId: string;
}
