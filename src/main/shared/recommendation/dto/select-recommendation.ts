// dto/select-recommendation.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class UseSelectRecommendationDto {
  @ApiProperty({
    example: ['uuid-1', 'uuid-2'],
    description: 'Array of recommendation IDs user selects',
  })
  @IsArray()
  @IsUUID('all', { each: true })
  recommendationIds: string[];
}

