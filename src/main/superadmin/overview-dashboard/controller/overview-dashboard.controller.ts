import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { OverviewDashboardService } from '../service/overview-dashboard.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateTotalPageViewDto } from '../dto/create-page-view.dto';
import { ValidateSuperAdmin } from 'src/common/jwt/jwt.decorator';

@ApiTags('Super Admin Overview Dashboard')
@Controller('overview-dashboard')
export class OverviewDashboardController {
  constructor(
    private readonly overviewDashboardService: OverviewDashboardService,
  ) {}
  @ApiOperation({
    summary:
      'Dshboard  only super Admin increment total page view for user only',
  })
  // -----------get admin total page view + 15% bonus-------
  @ApiBearerAuth()
  @ValidateSuperAdmin()
  @Get('pageview')
  @ApiOperation({
    summary:
      'Get total page views last month how to increase or dicrease  with pesentance ',
  })
  async getTotal() {
    const result = await this.overviewDashboardService.getTotalWithBonus();
    return { success: true, data: result };
  }
  // ------------    page view    ----------------

  @Post('pageview')
  @ApiOperation({ summary: 'Increment total page view for user only' })
  @ApiBody({ type: CreateTotalPageViewDto })
  async increment(@Body() dto: CreateTotalPageViewDto) {
    const total = await this.overviewDashboardService.increment(dto);
    return { success: true, count: total.count };
  }

  @ApiOperation({
    summary: 'Create new content with files and additional data',
  })

  // -----------get admin total user-------
  @ApiBearerAuth()
  @ValidateSuperAdmin()
  @Get('totaluser')
  @ApiOperation({
    summary:
      'Get total users crated views last month how to increase or dicrease  with pesentance',
  })
  async getTotaluser() {
    const result = await this.overviewDashboardService.getTotalUserLastMonth();
    return { success: true, data: result };
  }
  // ------------get admin user role & active overview----------

  @ApiBearerAuth()
  @ValidateSuperAdmin()
  @Get('totaluser-activity')
  @ApiOperation({
    summary: 'Get total users activity for super admin overview',
  })
  async getTotalUserActivity() {
    const result = await this.overviewDashboardService.getTotalUserActivity();
    return { success: true, data: result };
  }

  // -----------Traffic & Engagement Overview (Admin)--------------------
  @ApiBearerAuth()
  @ValidateSuperAdmin()
  @Get('traffic-engagement')
  @ApiOperation({ summary: 'Get traffic & engagement overview superadmin' })
  async getOverview() {
    const result = await this.overviewDashboardService.trafficEngagement();
    return { success: true, data: result };
  }

  // -----------------Recent Activity-----------------------
  @ApiBearerAuth()
  @ValidateSuperAdmin()
  @Get('recent-activity')
  @ApiOperation({ summary: 'Get Recent activity overview superadmin' })
  async getRecentActivity() {
    const result = await this.overviewDashboardService.recentActivity();
    return { success: true, data: result };
  }

  
}
