import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AdminDashboardService } from '../service/admin-dashboard.service';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ValidateAdmin,
  ValidateSuperAdmin,
} from 'src/common/jwt/jwt.decorator';
@ApiTags('Admin Dashboard (manage admin dashboard data)')
@Controller('admin-dashboard')
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}
  // ------------------admin dashboard overview--------------------
  @ApiOperation({ summary: 'admin get oveview' })
  @ApiBearerAuth()
  @ValidateAdmin()
  @Get('overview')
  getAdminDashboardOverview() {
    return this.adminDashboardService.getAdminDashboardOverview();
  }

  // -------------------  Admin only -------------------
  // -----------Traffic & Engagement Overview (Admin)--------------------
  @ApiBearerAuth()
  @ValidateSuperAdmin()
  @Get('traffic-engagement')
  @ApiOperation({ summary: 'Get traffic & engagement overview superadmin' })
  async getOverview() {
    const result = await this.adminDashboardService.trafficEngagement();
    return { success: true, data: result };
  }

  // -----------------Recent Activity-----------------------
  @ApiBearerAuth()
  @ValidateSuperAdmin()
  @Get('recent-activity')
  @ApiOperation({ summary: 'Get Recent activity overview superadmin' })
  async getRecentActivity() {
    const result = await this.adminDashboardService.recentActivity();
    return { success: true, data: result };
  }
}
