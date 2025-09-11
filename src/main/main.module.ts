import { Module } from '@nestjs/common';

import { SubscribeModule } from './shared/subscribe/subscribe.module';
import { RecommendationModule } from './shared/recommendation/recommendation.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { UsermanageModule } from './superadmin/usermanage/usermanage.module';
import { ContentmanageModule } from './superadmin/contentmanage/contentmanage.module';
import { CategorySubcategoryModule } from './contents/category-subcategory/category-subcategory.module';

import { CommunityModule } from './community/community.module';
import { ContentModule } from './contents/content/content.module';

import { OverviewDashboardModule } from './superadmin/overview-dashboard/overview-dashboard.module';
import { NotificationSettingModule } from './shared/notification-setting/notification-setting.module';

import { AdminDashboardModule } from './admin/admin-dashboard/admin-dashboard.module';
import { PaymentModule } from './shared/payment/payment.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AdminManagementModule } from './admin/admin-management/admin-management.module';
import { LiveEventModule } from './contents/live-event/live-event.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuthModule,
    SubscribeModule,
    RecommendationModule,
    UsersModule,
    UsermanageModule,
    ContentmanageModule,
    CategorySubcategoryModule,
    CommunityModule,
    ContentModule,
    OverviewDashboardModule,
    NotificationSettingModule,
    LiveEventModule,
    AdminDashboardModule,
    PaymentModule,
    AdminManagementModule,
  ],
  controllers: [],
  providers: [],
})
export class MainModule {}
