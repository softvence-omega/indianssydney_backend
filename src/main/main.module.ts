import { Module } from '@nestjs/common';

import { SubscribeModule } from './subscribe/subscribe.module';
import { RecommendationModule } from './recommendation/recommendation.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { UsermanageModule } from './superadmin/usermanage/usermanage.module';
import { ContentmanageModule } from './superadmin/contentmanage/contentmanage.module';
import { NotificationModule } from './notification/notification.module';
import { CategorySubcategoryModule } from './contents/category-subcategory/category-subcategory.module';
import { ContentsmanageModule } from './contents/contentsmanage/contentsmanage.module';
import { CommunityModule } from './community/community.module';

@Module({
  imports: [
    AuthModule,
    SubscribeModule,
    RecommendationModule,
    UsersModule,
    UsermanageModule,
    ContentmanageModule,
    NotificationModule,
    CategorySubcategoryModule,
    ContentsmanageModule,
    CommunityModule,
  ],
  controllers: [],
  providers: [],
})
export class MainModule {}
