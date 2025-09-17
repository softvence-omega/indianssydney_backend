import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { CreateLiveEventDto } from '../dto/create-live-event.dto';
import { UpdateLiveEventDto } from '../dto/update-live-event.dto';
import { HandleError } from 'src/common/error/handle-error.decorator';

@Injectable()
export class LiveEventService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------- Create Live Event ----------------
  @HandleError('Failed to create live event')
  async createLiveEvent(userId: string, dto: CreateLiveEventDto) {
    return this.prisma.liveEvent.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  // ---------------- Get all live events ----------------
  @HandleError('Failed to get live events')
  async getLiveEvents() {
    return this.prisma.liveEvent.findMany({
      include: { user: true },
      orderBy: { startTime: 'asc' },
    });
  }

  // ---------------- Get live event by id ----------------
  @HandleError('Failed to get live event')
  async getLiveEventById(id: string) {
    const event = await this.prisma.liveEvent.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!event) throw new NotFoundException('Live event not found');
    return event;
  }

  // ---------------- Update live event by id ----------------
  @HandleError('Failed to update live event')
  async updateLiveEvent(id: string, dto: UpdateLiveEventDto) {
    const existing = await this.prisma.liveEvent.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Live event not found');

    return this.prisma.liveEvent.update({
      where: { id },
      data: dto,
    });
  }

  // ---------------- Delete live event by id ----------------
  @HandleError('Failed to delete live event')
  async deleteLiveEvent(id: string) {
    const existing = await this.prisma.liveEvent.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Live event not found');

    return this.prisma.liveEvent.delete({ where: { id } });
  }
}
