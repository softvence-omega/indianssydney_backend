import { Module } from '@nestjs/common';

import { SubscribeModule } from './subscribe/subscribe.module';
import { RecommendationModule } from './recommendation/recommendation.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule, SubscribeModule, RecommendationModule, UsersModule],
  controllers: [],
  providers: [],
})
export class MainModule {}
