import { Controller, Get, Body, Patch, Param } from '@nestjs/common';
import { AdminManagementService } from '../service/admin-management.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ContentStatusChangeDto } from '../dto/admin-contentstatus.dto';
import { ValidateAdmin } from 'src/common/jwt/jwt.decorator';
@ApiTags('Admin Management (manage admin content like approve,decline,pending)')
@Controller('admin-management')
export class AdminManagementController {
  constructor(
    private readonly adminManagementService: AdminManagementService,
  ) {}

  // -----------Admin admin change content status ------------
  @ApiOperation({ summary: ' Admin change content status' })
  @ApiBearerAuth()
  @ValidateAdmin()
  @Patch(':id/content-status')
  async changeContentStatus(
    @Param('id') id: string,
    @Body() dto: ContentStatusChangeDto,
  ) {
    return this.adminManagementService.updateContentStatus(id, dto.status);
  }
  // -----------Admin admin get recent  ------------
  @ApiOperation({ summary: 'Admin Admin get recent  status-pentding' })
  @ApiBearerAuth()
  @ValidateAdmin()
  @Get('recent-contents')
  async getRecentContent() {
    return this.adminManagementService.getRecentContent();
  }
  // -----------Admin admin get all content with status pending ------------
  @ApiOperation({ summary: 'Admin Admin get all status-pentding' })
  @ApiBearerAuth()
  @ValidateAdmin()
  @Get('all-contents-pending')
  async getAllContentPending() {
    return this.adminManagementService.getPendingContents();
  }

  // ------------------sttus Approve----
  @ApiOperation({ summary: 'Admin Admin get all status-pentding' })
  @ApiBearerAuth()
  @ValidateAdmin()
  @Get('all-contents-approve')
  async getAllContentApprove() {
    return this.adminManagementService.getApprovedContents();
  }

  // ------------------status Reject----
  @ApiOperation({ summary: 'Admin Admin get all status-pentding' })
  @ApiBearerAuth()
  @ValidateAdmin()
  @Get('all-contents-Decline')
  async getAllContentDecline() {
    return this.adminManagementService.getDeclinedContents();
  }
}
