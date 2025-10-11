import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { CreateLiveEventDto } from '../dto/create-live-event.dto';
import { UpdateLiveEventDto } from '../dto/update-live-event.dto';
import { HandleError } from 'src/common/error/handle-error.decorator';
import { FileService } from 'src/lib/file/file.service';
import { AppError } from 'src/common/error/handle-error.app';
import { NotificationGateway } from 'src/lib/notificaton/notification.gateway';

@Injectable()
export class LiveEventService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  // ---------------- Create Live Event ----------------
  @HandleError('Failed to create live event')
async createLiveEvent(userId: string, dto: CreateLiveEventDto & { thumbnailS3?: string }) {
  if (!dto.thumbnailS3) {
    throw new AppError(400, 'Thumbnail image is required');
  }

  const { tags, thumbnail, thumbnailS3, ...restDto } = dto;
  const normalizedTags = Array.isArray(tags)
    ? tags
    : typeof tags === 'string'
      ? (tags as string).split(',').map((t) => t.trim())
      : [];

  const result = await this.prisma.$transaction(async (tx) => {
    const liveEvent = await tx.liveEvent.create({
      data: {
        ...restDto,
        userId,
        tags: normalizedTags,
        thumbnail: thumbnailS3, 
      },
    });

    const notification = await tx.notification.create({
      data: {
        type: 'LiveEvent',
        title: 'New Live Event Created',
        message: `${restDto.title} is now live!`,
        meta: {
          liveEventId: liveEvent.id,
          title: restDto.title,
          thumbnail: thumbnailS3,
          userId,
          date: new Date().toISOString(),
        },
      },
    });

    const users = await tx.user.findMany({ select: { id: true } });
    const userIds = users.map((u) => u.id);

    await tx.userNotification.createMany({
      data: userIds.map((uId) => ({
        userId: uId,
        notificationId: notification.id,
      })),
      skipDuplicates: true,
    });

    await this.notificationGateway.notifyAllUsers('liveEvent', {
      title: notification.title,
      message: notification.message,
      meta: notification.meta,
    } as any);

    return liveEvent;
  });

  return {
    success: true,
    message: 'Live event created successfully',
    data: result,
  };
}


  // ---------------- Get All (only non-deleted) ----------------
  @HandleError('Failed to get live events')
  async getLiveEvents() {
    return this.prisma.liveEvent.findMany({
      where: { isDeleted: false },
      include: { user: true },
      orderBy: { startTime: 'asc' },
    });
  }

  // ---------------- Get By ID ----------------
  @HandleError('Failed to get live event')
  async getLiveEventById(id: string) {
    const event = await this.prisma.liveEvent.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!event || event.isDeleted) {
      throw new NotFoundException('Live event not found');
    }
    return event;
  }

  // ---------------- Update ----------------
  @HandleError('Failed to update live event')
async updateLiveEvent(
  id: string,
  dto: UpdateLiveEventDto & { thumbnailS3?: string },
) {
  const existing = await this.prisma.liveEvent.findUnique({ where: { id } });
  if (!existing || existing.isDeleted) {
    throw new NotFoundException('Live event not found');
  }

  const { thumbnail, thumbnailS3, tags, ...restDto } = dto;

  const normalizedTags = tags
    ? Array.isArray(tags)
      ? tags
      : typeof tags === 'string'
        ? (tags as string).split(',').map((tag) => tag.trim())
        : []
    : undefined;

  const updatedEvent = await this.prisma.liveEvent.update({
    where: { id },
    data: {
      ...restDto,
      ...(thumbnailS3 && { thumbnail: thumbnailS3 }),
      ...(normalizedTags && { tags: normalizedTags }),
    },
  });

  return {
    success: true,
    message: 'Live event updated successfully',
    data: updatedEvent,
  };
}

  // ---------------- Soft Delete ----------------
  @HandleError('Failed to delete live event')
  async deleteLiveEvent(id: string) {
    const existing = await this.prisma.liveEvent.findUnique({ where: { id } });
    if (!existing || existing.isDeleted) {
      throw new NotFoundException('Live event not found');
    }

    return this.prisma.liveEvent.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  // ---------------- Restore (optional) ----------------
  @HandleError('Failed to restore live event')
  async restoreLiveEvent(id: string) {
    const existing = await this.prisma.liveEvent.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Live event not found');

    return this.prisma.liveEvent.update({
      where: { id },
      data: { isDeleted: false },
    });
  }
}
