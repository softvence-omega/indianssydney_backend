import { Injectable } from '@nestjs/common';
import { HandleError } from 'src/common/error/handle-error.decorator';
import { successResponse, TResponse } from 'src/common/utils/response.util';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { NotificationToggleDto } from '../dto/notification-toggle.dto';

@Injectable()
export class NotificationSettingService {
  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to get notification setting')
  async getNotificationSetting(userId: string): Promise<TResponse<any>> {
    const result = await this.prisma.notificationToggle.findUnique({
      where: {
        userId: userId,
      },
      include: {
        user: true,
      },
    });

    // --- If no setting found, create default setting ---
    if (!result) {
      const notificationToggle = await this.prisma.notificationToggle.create({
        data: {
          userId: userId,
        },
      });
      return successResponse(
        notificationToggle,
        'Notification setting created successfully',
      );
    }

    return successResponse(result, 'Notification setting found successfully');
  }

  @HandleError('Failed to update notification setting')
  async updateNotificationSetting(
    userId: string,
    dto: NotificationToggleDto,
  ): Promise<TResponse<any>> {
    const result = await this.prisma.notificationToggle.upsert({
      where: {
        userId: userId,
      },
      update: {
        email: dto.email,
        communication: dto.communication,
        scheduling: dto.scheduling,
        message: dto.message,
        userRegistration: dto.userRegistration,
      },
      create: {
        userId: userId,
        email: dto.email,
        communication: dto.communication,

        scheduling: dto.scheduling,
        message: dto.message,
        userRegistration: dto.userRegistration,
      },
    });
    return successResponse(result, 'Notification setting updated successfully');
  }
}
