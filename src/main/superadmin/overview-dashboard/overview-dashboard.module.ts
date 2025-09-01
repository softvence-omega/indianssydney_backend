import { Module } from '@nestjs/common';
import { OverviewDashboardService } from './service/overview-dashboard.service';
import { OverviewDashboardController } from './controller/overview-dashboard.controller';

@Module({
  controllers: [OverviewDashboardController],
  providers: [OverviewDashboardService],
})
export class OverviewDashboardModule {}
