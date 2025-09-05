import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetUser, ValidateAuth } from 'src/common/jwt/jwt.decorator';
import { NotificationSettingService } from '../service/notification-setting.service';
import { TResponse } from 'src/common/utils/response.util';
import { NotificationToggleDto } from '../dto/notification-toggle.dto';


@ApiTags('Notification Setting')
@ValidateAuth()
@ApiBearerAuth() 
@Controller('notification-setting')
export class NotificationSettingController {
  constructor(
    private readonly notificationSettingService: NotificationSettingService,
  ) {}

  @Get()
  async getNotificationSetting(
    @GetUser('userId') userId: string,
  ): Promise<TResponse<any>> {
    return await this.notificationSettingService.getNotificationSetting(userId);
  }

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
}