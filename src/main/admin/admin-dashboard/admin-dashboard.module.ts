import { Module } from '@nestjs/common';
import { AdminDashboardService } from './service/admin-dashboard.service';
import { AdminDashboardController } from './controller/admin-dashboard.controller';

@Module({
  controllers: [AdminDashboardController],
  providers: [AdminDashboardService],
})
export class AdminDashboardModule {}
