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

  @ApiBearerAuth()
  @ValidateAdmin() 
  @Get('traffic-engagement')
  @ApiOperation({ summary: 'Get traffic & engagement overview admin' })
  async getOverview() {
    const result = await this.adminDashboardService.trafficEngagement();
    return { success: true, data: result };
  }

  // -----------------Recent Activity-----------------------
  @ApiBearerAuth()
  @ValidateAdmin()
  @Get('recent-activity')
  @ApiOperation({ summary: 'Get Recent activity overview super admin' })
  async getRecentActivity() {
    const result = await this.adminDashboardService.recentActivity();
    return { success: true, data: result };
  }
  // ------ top performance contents-------
  @ApiBearerAuth()
  @ValidateAdmin()
  @Get('top-performance')
  @ApiOperation({ summary: 'Get top performance contents super admin top performance with view' })
  async getTopPerformance() {
    const result = await this.adminDashboardService.topPerformance();
    return { success: true, data: result };
  }

  // -----content history----
  @ApiBearerAuth()
  @ValidateAdmin()
  @Get('top-contributor')
  @ApiOperation({ summary: 'Get content history topcontributor' })
  async getContentHistory() {
    const result = await this.adminDashboardService.contentHistory();
    return { success: true, data: result };
  }
  
  

}
