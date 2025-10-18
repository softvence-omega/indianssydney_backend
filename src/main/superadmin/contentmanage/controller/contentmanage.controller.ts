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
import {
  ValidateAdmin,
  ValidateSuperAdmin,
} from 'src/common/jwt/jwt.decorator';
import { ContentStatusChangeDto } from '../dto/superadmin-contentmanage.dto';
import { PaymentPlanDto } from '../dto/payment-plane.dto';
import { UpdateReportStatusDto } from '../dto/report.status.dto';

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

  // ------------------status Approve ----------------
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

  // Pending grouped by content type
  @ApiOperation({ summary: 'Admin get all pending contents grouped by type' })
  @ApiBearerAuth()
  @ValidateAdmin()
  @Get('pending-by-type-superadmin')
  async getPendingContentsByTypesuperadmin() {
    return this.contentmanageService.getPendingContentsByTypesuperadmin();
  }

  // Approved grouped by content type
  @ApiOperation({ summary: 'Admin get all approved contents grouped by type' })
  @ApiBearerAuth()
  @ValidateAdmin()
  @Get('approved-by-type-superadmin')
  async getApprovedContentsByTypesuperadmin() {
    return this.contentmanageService.getApprovedContentsByTypesuperadmin();
  }

  // Declined grouped by content type
  @ApiOperation({
    summary: 'super admin get all declined contents grouped by type',
  })
  @ApiBearerAuth()
  @ValidateAdmin()
  @Get('declined-by-type-superadmin')
  async getDeclinedContentsByTypesuperadmin() {
    return this.contentmanageService.getDeclinedContentsByTypesuperadmin();
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
  @ValidateAdmin()
  @Get('reports')
  async getAllReports() {
    return this.contentmanageService.getAllReports();
  }
  // ---------get single report super admin---------------------
  @ApiOperation({ summary: 'Super Admin get single report with user profiles' })
  @ApiBearerAuth()
  @ValidateAdmin()
  @Get('reports/:id')
  async getSingleReport(@Param('id') id: string) {
    return this.contentmanageService.getSingleReport(id);
  }
  //---------------   soft delete report content. ----------
  @ApiOperation({ summary: 'Soft delete a report content' })
  @ApiBearerAuth()
  @ValidateAdmin()
  @Patch('reports/:id/soft-delete')
  async softDeleteReportContent(@Param('id') id: string) {
    return this.contentmanageService.softDeleteReportContent(id);
  }

  // ------report status update------
  @ApiOperation({ summary: 'Super Admin update report status' })
  @ApiBearerAuth()
  @ValidateAdmin()
  @Patch('reports/:id/status')
  async updateReportStatus(
    @Param('id') reportId: string,
    @Body() updateReportStatusDto: UpdateReportStatusDto,
  ) {
    return this.contentmanageService.updateReportStatus(
      reportId,
      updateReportStatusDto.status,
    );
  }

  // ---------Get all hate space ---------------------
  // @ApiOperation({
  //   summary: 'Super Admin get all content flagged as hate speech',
  // })
  // @ApiBearerAuth()
  // @ValidateSuperAdmin()
  // @Get('hate-space-contents')
  // async getAllHateSpace() {
  //   return this.contentmanageService.getAllHateSpace();
  // }

  @Patch(':id/soft-delete')
  @ApiOperation({ summary: 'Soft delete a content' })
  async softDelete(@Param('id') id: string) {
    return this.contentmanageService.softDeleteContent(id);
  }

  // --------- Get all hate comments ---------
  @ApiOperation({
    summary: 'Super Admin get all comments flagged as hate speech',
  })
  @ApiBearerAuth()
  @ValidateSuperAdmin()
  @Get('hate-comments')
  async getAllHateComments() {
    return this.contentmanageService.getAllHateComments();
  }

  // --------- Approve a hate comment ---------
  @ApiOperation({
    summary: 'Super Admin approve a comment flagged as hate speech',
  })
  @ApiBearerAuth()
  @ValidateSuperAdmin()
  @Patch('hate-comments/:id/approve')
  async approveHateComment(@Param('id') id: string) {
    return this.contentmanageService.approveHateComment(id);
  }

  // --------- Soft delete a hate comment ---------
  @ApiOperation({
    summary: 'Super Admin soft delete a comment flagged as hate speech',
  })
  @ApiBearerAuth()
  @ValidateSuperAdmin()
  @Patch('hate-comments/:id/soft-delete')
  async softDeleteHateComment(@Param('id') id: string) {
    return this.contentmanageService.softDeleteHateComment(id);
  }
}
