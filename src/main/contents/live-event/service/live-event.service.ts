import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { CreateLiveEventDto } from '../dto/create-live-event.dto';
import { UpdateLiveEventDto } from '../dto/update-live-event.dto';
import { HandleError } from 'src/common/error/handle-error.decorator';
import { FileService } from 'src/lib/file/file.service';
import { AppError } from 'src/common/error/handle-error.app';

@Injectable()
export class LiveEventService {
  constructor(private readonly prisma: PrismaService,
    private readonly fileService: FileService
  ) {}

  // ---------------- Create ----------------
  @HandleError('Failed to create live event')
  async createLiveEvent(userId: string, dto: CreateLiveEventDto) {
       if (!dto.thumbnail) {
          throw new AppError(400, 'Recommendation image is required');
        }
    
        let fileInstance: any;
        if (dto.thumbnail) {
          fileInstance = await this.fileService.processUploadedFile(dto.thumbnail);
        }
    const { thumbnail, tags, ...restDto } = dto;

    let normalizedTags: string[] = [];
    if (Array.isArray(tags)) {
      normalizedTags = tags;
    } else if (typeof tags === 'string') {
      normalizedTags = (tags as string).split(',').map((tag) => tag.trim());
    }

    return this.prisma.liveEvent.create({
      data: {
        ...restDto,
        userId,
        tags: normalizedTags,
        thumbnail: fileInstance.url,
      },
    });
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
  async updateLiveEvent(id: string, dto: UpdateLiveEventDto) {
    const existing = await this.prisma.liveEvent.findUnique({ where: { id } });
    if (!existing || existing.isDeleted) {
      throw new NotFoundException('Live event not found');
    }
    let fileInstance: any;
        if (dto.thumbnail) {
          fileInstance = await this.fileService.processUploadedFile(dto.thumbnail);
        }
    const { thumbnail, tags, ...restDto } = dto;

    const normalizedTags = tags
      ? Array.isArray(tags)
        ? tags
        : typeof tags === 'string'
        ? (tags as string).split(',').map((tag) => tag.trim())
        : []
      : undefined;

    return this.prisma.liveEvent.update({
      where: { id },
      data: {
        ...restDto,
        ...(fileInstance && { thumbnail: fileInstance.url }),
        ...(normalizedTags && { tags: normalizedTags }),
      },
    });
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
