import { Body, Controller, Delete, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  GetUser,
  ValidateAuth,
  ValidateUser,
} from 'src/common/jwt/jwt.decorator';
import { NotificationSettingService } from '../service/notification-setting.service';
import { successResponse, TResponse } from 'src/common/utils/response.util';
import { NotificationToggleDto } from '../dto/notification-toggle.dto';
import { get } from 'axios';
import { HandleError } from 'src/common/error/handle-error.decorator';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { AppError } from 'src/common/error/handle-error.app';

@ApiTags('Notification Setting')
@Controller('notification-setting')
export class NotificationSettingController {
  constructor(
    private readonly notificationSettingService: NotificationSettingService,
    private readonly prisma: PrismaService,
  ) {}
  @ValidateAuth()
  @ApiBearerAuth()
  @Get()
  async getNotificationSetting(
    @GetUser('userId') userId: string,
  ): Promise<TResponse<any>> {
    return await this.notificationSettingService.getNotificationSetting(userId);
  }
  @ValidateAuth()
  @ApiBearerAuth()
  @Get('all')
  async getAllNotificationSetting(): Promise<TResponse<any>> {
    return await this.notificationSettingService.getAllNotificationSetting();
  }

  @ValidateAuth()
  @ApiBearerAuth()
  @Patch()
  async updateNotificationSetting(
    @GetUser('userId') userId: string,
    @Body() dto: NotificationToggleDto,
  ): Promise<TResponse<any>> {
    return await this.notificationSettingService.updateNotificationSetting(
      userId,
      dto,
    );
  }

  @ApiOperation({ summary: 'get all notifications for USER ' })
  @Get('all-notifications')
  async getAllNotifications() {
    return this.notificationSettingService.getAllNotifications();
  }

  @ApiBearerAuth()
  @ValidateUser()
  @Delete('delete-notification')
  async deleteAllNotification(@GetUser('userId') userId: string) {
    return this.notificationSettingService.deleteAllNotification(userId);
  }
}
