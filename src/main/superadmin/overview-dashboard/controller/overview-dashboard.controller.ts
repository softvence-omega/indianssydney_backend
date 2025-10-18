import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { OverviewDashboardService } from '../service/overview-dashboard.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTotalPageViewDto } from '../dto/create-page-view.dto';
import { ValidateSuperAdmin } from 'src/common/jwt/jwt.decorator';
import { EngagementQueryDto } from '../dto/engagement.dto';

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

  // -------------admin status get activity edtor----------

  @ApiOperation({
    summary:
      ' editor content activity .admin can be seen where contibute content status ',
  })
  @ApiBearerAuth()
  @ValidateSuperAdmin()
  @Get('editor-content-activity')
  async geteditorContentActivity() {
    const result = await this.overviewDashboardService.editorContentActivity();
    return { success: true, data: result };
  }
  // -----------------Top Tags-----------------------
  @ApiTags('Analytics Dashboard Super admin')
  @ApiOperation({ summary: 'Get top tags data for super admin' })
  @ApiBearerAuth()
  @ValidateSuperAdmin()
  @Get('analytics-dashboard/top-tags')
  async getAnalyticsDashboardTopTags() {
    const result = await this.overviewDashboardService.analyticsDashboardTags();
    return { success: true, data: result };
  }
  @ApiTags('Analytics Dashboard Super admin')
  @ApiOperation({ summary: 'Get analytics dashboard data for super admin' })
  @ApiBearerAuth()
  @ValidateSuperAdmin()
  @Get('analytics-dashboard/top-tags')
  async getAnalyticsDashboardTags() {
    const result = await this.overviewDashboardService.analyticsDashboardTags();
    return { success: true, data: result };
  }
  // -----------------Content Metrics-----------------------
  @ApiTags('Analytics Dashboard Super admin')
  @ApiOperation({ summary: 'Get Content Metrics data for super admin' })
  @ApiBearerAuth()
  @ValidateSuperAdmin()
  @Get('analytics-dashboard/content-metrics')
  async getContentMetrics() {
    const result = await this.overviewDashboardService.contentMetrics();
    return { success: true, data: result };
  }
// -----------------Engagement-Personalization-----------------------
  @ApiTags('Analytics Dashboard Super admin')
  @ApiOperation({
    summary: 'Get User Engagement & Personalization AI data for super admin',
  })
  @ApiBearerAuth()
  @ApiQuery({
    name: 'period',
    required: false,
    description: 'Filter period for metrics',
    enum: ['week', 'month', 'quarter', 'all'],
    example: 'month',
  })
  @ApiOperation({
    summary:
      'Get analytics Engagement-Personalization dashboard data for super admin',
  })
  @ValidateSuperAdmin()
  @Get('Engagement-Personalization')
  async getUserEngagementPersonalization(@Query() query: EngagementQueryDto) {
    const period = query.period || 'all';
    const result =
      await this.overviewDashboardService.getUserEngagementPersonalization(
        period,
      );
    return { success: true, data: result };
  }

  // ---------- Community Moderation AI (Last 24h)--
  @ApiTags('Analytics Dashboard Super admin')
  @ApiOperation({
    summary: 'Community Moderation AI  data for super admin',
  })
  @ApiBearerAuth()
  @ValidateSuperAdmin()
  @Get('community-moderation')
  async getCommunityModerationAI() {
    const result =
      await this.overviewDashboardService.getCommunityModerationAIOverview();
    return { success: true, data: result };
  }

  // @ApiTags('Analytics Dashboard Super admin')
  // @ApiOperation({ summary: 'Community Moderation AI  data for super admin' })
  // @ApiBearerAuth()
  // @ValidateSuperAdmin()
  // @Get('community-moderation ')
  // async getCommunityModerationAI () {

  //   const result = await this.overviewDashboardService.getCommunityModerationAI();
  //   return { success: true, data: result };
  // }
}
