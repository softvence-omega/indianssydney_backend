import { Controller, Get, Body, Patch, Param, Req } from '@nestjs/common';
import { AdminManagementService } from '../service/admin-management.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import {
  ContentStatusChangeDto,
  ContributorApplyStatusDto,
} from '../dto/admin-contentstatus.dto';
import { GetUser, ValidateAdmin } from 'src/common/jwt/jwt.decorator';
@ApiTags(
  'Admin Management or Editor (manage admin content & Contibute permission like approve,decline,pending & analyis content, langauge ,category)',
)
@Controller('admin-management')
export class AdminManagementController {
  constructor(
    private readonly adminManagementService: AdminManagementService,
  ) {}

  // -----------Admin admin change content status ------------
  @ApiOperation({ summary: 'Admin change content status' })
  @ApiBearerAuth()
  @ValidateAdmin()
  @Patch(':id/content-status')
  async changeContentStatus(
    @Param('id') id: string,
    @Body() dto: ContentStatusChangeDto,
    @GetUser('userId') userId: string,
  ) {
    return this.adminManagementService.updateContentStatus(
      id,
      dto.status,
      userId,
    );
  }

  // -----------Admin admin get all content with status pending ------------
  @ApiOperation({ summary: 'Admin Admin get all status-pentding' })
  @ApiBearerAuth()
  @ValidateAdmin()
  @Get('all-contents-pending')
  async getAllContentPending() {
    return this.adminManagementService.getPendingContents();
  }

  // ------------------sttus Approve-----------------------
  @ApiOperation({ summary: 'Admin Admin get all status-pentding' })
  @ApiBearerAuth()
  @ValidateAdmin()
  @Get('all-contents-approve')
  async getAllContentApprove() {
    return this.adminManagementService.getApprovedContents();
  }

  // ------------------status Reject------------------
  @ApiOperation({ summary: 'Admin Admin get all status-pentding' })
  @ApiBearerAuth()
  @ValidateAdmin()
  @Get('all-contents-Decline')
  async getAllContentDecline() {
    return this.adminManagementService.getDeclinedContents();
  }
  // -----------Admin admin get recent  ------------
  @ApiOperation({ summary: 'Admin Admin get recent  status-pentding' })
  @ApiBearerAuth()
  @ValidateAdmin()
  @Get('recent-contents')
  async getRecentContent() {
    return this.adminManagementService.getRecentContent();
  }

  // -------------------editor can be manage contibute user---------------
  @ApiOperation({
    summary:
      'Admin updates contributor application status . contibutor can apply for content create',
  })
  @ApiOperation({ summary: 'Admin updates contributor application status' })
  @ApiBearerAuth()
  @ValidateAdmin()
  @Get('contributor/all')
  async getAllContributor() {
    return this.adminManagementService.getAllContributor();
  }
  // ---------- admin anaylics---------------------
  @ApiOperation({ summary: 'Admin Analytics top category ' })
  @ApiBearerAuth()
  @ValidateAdmin()
  @Get('analytics/top-category')
  async getAnalyticsTopCategory() {
    return this.adminManagementService.getAnalyticsTopCategory();
  }
  // ----------analylis langauge ---
  @ApiOperation({ summary: 'Admin Analytics top langauge' })
  @ApiBearerAuth()
  @ValidateAdmin()
  @Get('analytics/top-language')
  async getAnalyticsTopLanguage() {
    return this.adminManagementService.getAnalyticsTopLanguage();
  }
  // ---------analyis content---------
  @ApiOperation({ summary: 'Admin Analytics top content' })
  @ApiBearerAuth()
  @ValidateAdmin()
  @Get('analytics/top-content')
  async getAnalyticsTopContent() {
    return this.adminManagementService.getAnalyticsTopContent();
  }
  // ------------------manage contibute user  approve/decline/pending ---------------
  @ApiOperation({
    summary: 'Admin manage contibute user  approve/decline/pending',
  })
  @ApiBearerAuth()
  @ValidateAdmin()
  @Patch('contributor/:id/status')
  async updateContributorStatus(
    @Param('id') applicationId: string,
    @Body() dto: ContributorApplyStatusDto,
  ) {
    return this.adminManagementService.updateContributorApplicationStatus(
      applicationId,
      dto.status,
    );
  }
}
