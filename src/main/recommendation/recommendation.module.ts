import { Module } from '@nestjs/common';
import { RecommendationService } from './service/recommendation.service';
import { RecommendationController } from './controller/recommendation.controller';

@Module({
  controllers: [RecommendationController],
  providers: [RecommendationService],
})
export class RecommendationModule {}
