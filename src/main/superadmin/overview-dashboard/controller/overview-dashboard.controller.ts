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
import { CreateOverviewDashboardDto } from '../dto/create-overview-dashboard.dto';
import { UpdateOverviewDashboardDto } from '../dto/update-overview-dashboard.dto';
import { ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger';
import { CreateTotalPageViewDto } from '../dto/create-page-view.dto';
import { ValidateAuth, ValidateSuperAdmin } from 'src/common/jwt/jwt.decorator';

@Controller('overview-dashboard')
export class OverviewDashboardController {
  constructor(
    private readonly overviewDashboardService: OverviewDashboardService,
  ) {}
  // ------------page view----------------

  @Post('pageview')
  @ApiOperation({ summary: 'Increment total page view' })
  @ApiBody({ type: CreateTotalPageViewDto })
  async increment(@Body() dto: CreateTotalPageViewDto) {
    const total = await this.overviewDashboardService.increment(dto);
    return { success: true, count: total.count };
  }
  @ApiBearerAuth()
  @ValidateSuperAdmin()
  @Get('pageview')
  @ApiOperation({ summary: 'Get total page views +15% bonus' })
  async getTotal() {
    const result = await this.overviewDashboardService.getTotalWithBonus();
    return { success: true, data: result };
  }
  // -----------get admin total user-------
  @ApiBearerAuth()
  @ValidateSuperAdmin()
  @Get('totaluser')
  @ApiOperation({ summary: 'Get total page views +15% bonus' })
  async getTotaluser() {
    const result = await this.overviewDashboardService.getTotalUserLastMonth();
    return { success: true, data: result };
  }
  // ------------get admin user role & active overview----------

  @ApiBearerAuth()
  @ValidateSuperAdmin()
  @Get('totaluser-activity')
  @ApiOperation({ summary: 'Get total users activity for admin overview' })
  async getTotalUserActivity() {
    const result = await this.overviewDashboardService.getTotalUserActivity();
    return { success: true, data: result };
  }

  // Traffic & Engagement Overview (Admin)
  @ValidateAuth()
  @ValidateSuperAdmin()
  @Get('overview')
  @ApiOperation({ summary: 'Get traffic & engagement overview' })
  async getOverview() {
    const result = await this.overviewDashboardService.getOverview();
    return { success: true, data: result };
  }

  // @Post()
  // create(@Body() createOverviewDashboardDto: CreateOverviewDashboardDto) {
  //   return this.overviewDashboardService.create(createOverviewDashboardDto);
  // }

  @Get()
  findAll() {
    return this.overviewDashboardService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.overviewDashboardService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOverviewDashboardDto: UpdateOverviewDashboardDto,
  ) {
    return this.overviewDashboardService.update(
      +id,
      updateOverviewDashboardDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.overviewDashboardService.remove(+id);
  }
}
