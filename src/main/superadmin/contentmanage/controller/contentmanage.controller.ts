import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Post,
  Delete,
} from '@nestjs/common';
import { ContentmanageService } from '../service/contentmanage.service';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ValidateSuperAdmin } from 'src/common/jwt/jwt.decorator';
import { ContentStatusChangeDto } from '../dto/superadmin-contentmanage.dto';
import { PaymentPlanDto } from '../dto/payment-plane.dto';

@ApiTags('Super Admin content Manage & plane Mange & Report manage')
@Controller('contentmanage')
export class ContentmanageController {
  constructor(private readonly contentmanageService: ContentmanageService) {}
  // -----------super admin change content status ------------
  @ApiOperation({ summary: 'Super Admin change content status' })
  @ApiBearerAuth()
  @ValidateSuperAdmin()
  @Patch(':id/content-status')
  async changeContentStatus(
    @Param('id') id: string,
    @Body() dto: ContentStatusChangeDto,
  ) {
    return this.contentmanageService.updateContentStatus(id, dto.status);
  }

  @ApiOperation({ summary: 'Super Admin get all content with super admin' })
  @ApiBearerAuth()
  @ValidateSuperAdmin()
  @Get('all-content-manage')
  async getAllContentSuperadmin() {
    return this.contentmanageService.getAllContentSuperadmin();
  }
  // -----------super admin get recent  ------------
  @ApiOperation({ summary: 'Super Admin get recent  status-pentding' })
  @ApiBearerAuth()
  @ValidateSuperAdmin()
  @Get('recent-contents')
  async getRecentContent() {
    return this.contentmanageService.getRecentContent();
  }
  // -----------super admin get all content with status pending ------------
  @ApiOperation({ summary: 'Super Admin get all status-pentding' })
  @ApiBearerAuth()
  @ValidateSuperAdmin()
  @Get('all-contents-pending')
  async getAllContentPending() {
    return this.contentmanageService.getPendingContents();
  }

  // ------------------sttus Approve ----------------
  @ApiOperation({ summary: 'Super Admin get all status-pentding' })
  @ApiBearerAuth()
  @ValidateSuperAdmin()
  @Get('all-contents-approve')
  async getAllContentApprove() {
    return this.contentmanageService.getApprovedContents();
  }

  // ------------------status Reject-----------------
  @ApiOperation({ summary: 'Super Admin get all status-pentding' })
  @ApiBearerAuth()
  @ValidateSuperAdmin()
  @Get('all-contents-Decline')
  async getAllContentDecline() {
    return this.contentmanageService.getDeclinedContents();
  }

  // -------------------------payment plane create---------------------------------
  @ApiOperation({ summary: 'Super Admin create payment plan' })
  @ApiBearerAuth()
  @ValidateSuperAdmin()
  @Post('create-plan')
  async createPlan(@Body() payload: PaymentPlanDto) {
    return this.contentmanageService.createPlan(payload);
  }
  //------------------------------ get all payment plane ---------------------------------
  @ApiOperation({ summary: 'Super Admin get all payment plan' })
  @Get('all-plans')
  async getAllPlans() {
    return this.contentmanageService.getAllPlans();
  }

  // ------------- update plan -------------------
  @ApiOperation({ summary: 'Super Admin update payment plan' })
  @ApiBearerAuth()
  @ValidateSuperAdmin()
  @Patch('update-plan/:id')
  async updatePlan(@Param('id') id: string, @Body() payload: PaymentPlanDto) {
    return this.contentmanageService.updatePlan(id, payload);
  }
  // ------------- get single plan -------------------
  @ApiOperation({ summary: 'Super Admin get single payment plan' })
  @Get('single-plan/:id')
  async getSinglePlan(@Param('id') id: string) {
    return this.contentmanageService.getSinglePlan(id);
  }
  // --------------delete plan--------------
  @ApiOperation({ summary: 'Super Admin delete payment plan' })
  @ApiBearerAuth()
  @ValidateSuperAdmin()
  @Delete('delete-plan/:id')
  async deletePlan(@Param('id') id: string) {
    return this.contentmanageService.deletePlan(id);
  }

  // ---------get all report super admin---------------------
  @ApiOperation({ summary: 'Super Admin get all reports with user profiles' })
  @ApiBearerAuth()
  @ValidateSuperAdmin()
  @Get('reports')
  async getAllReports() {
    return this.contentmanageService.getAllReports();
  }
}
