import { Injectable } from '@nestjs/common';
import { HandleError } from 'src/common/error/handle-error.decorator';
import { successResponse, TResponse } from 'src/common/utils/response.util';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { NotificationToggleDto } from '../dto/notification-toggle.dto';
import { AppError } from 'src/common/error/handle-error.app';

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
    // if (!result) {
    //   const notificationToggle = await this.prisma.notificationToggle.create({
    //     data: {
    //       userId: userId,
    //     },
    //   });
    //   return successResponse(
    //     notificationToggle,
    //     'Notification setting created successfully',
    //   );
    // }

    return successResponse(result, 'Notification setting found successfully');
  }

  // -------------update notification setting --------------
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
  // -------------get all notification setting --------------
  @HandleError('Failed to get all notification setting')
  async getAllNotificationSetting(): Promise<TResponse<any>> {
    const result = await this.prisma.notificationToggle.findMany({
      include: {
        user: true,
      },
    });
    return successResponse(result, 'Notification setting found successfully');
  }

  async deleteNotificationSetting(userId: string): Promise<TResponse<any>> {
    const result = await this.prisma.notificationToggle.deleteMany({
      where: {
        userId: userId,
      },
    });
    return successResponse(result, 'Notification setting deleted successfully');
  } // -------------delete all notification setting --------------
  async deleteAllNotification(userId: string): Promise<TResponse<any>> {
    const result = await this.prisma.notificationToggle.deleteMany({
      where: {
        userId: userId,
      },
    });
    return successResponse(result, 'Notification setting deleted successfully');
  }

  @HandleError('Failed to  all notifications as seen')
  async getAllNotifications(): Promise<TResponse<any>> {
    // Fetch notifications for the user
    const notifications = await this.prisma.userNotification.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        notification: true,
      },
    });

    // Format the response
    const formattedNotofications = notifications.map((un) => ({
      id: un.notification.id,
      type: un.notification.type,
      title: un.notification.title,
      message: un.notification.message,
      createdAt: un.notification.createdAt,
      updatedAt: un.notification.updatedAt,
      meta: un.notification.meta || {},
    }));

    return successResponse(
      formattedNotofications,
      'All notifications marked as seen',
    );
  }
}
