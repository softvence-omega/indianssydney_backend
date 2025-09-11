import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { CreateLiveEventDto } from '../dto/create-live-event.dto';
import axios from 'axios';
import { HandleError } from 'src/common/error/handle-error.decorator';

@Injectable()
export class LiveEventService {
  constructor(private readonly prisma: PrismaService) {}

  private getAuthHeader() {
    const id = process.env.AGORA_CUSTOMER_ID;
    const secret = process.env.AGORA_SECRET;
    const basicAuth = Buffer.from(`${id}:${secret}`).toString('base64');
    return { Authorization: `Basic ${basicAuth}` };
  }

  async generateRtcToken(channelName: string, uid: string) {
    const url = `https://api.agora.io/dev/v1/channel/${channelName}`;
    const response = await axios.post(
      url,
      { cname: channelName, uid, clientRequest: {} },
      { headers: this.getAuthHeader() },
    );
    return response.data; // contains rtcToken
  }

  async generateRtmToken(uid: string) {
    const url = `https://api.agora.io/dev/v1/rtm/${uid}`;
    const response = await axios.post(
      url,
      { uid, clientRequest: {} },
      { headers: this.getAuthHeader() },
    );
    return response.data;
  }
  // ----------------Create a new live event--------------------
  @HandleError('Failed to create live event')
  async createLiveEvent(userId: string, dto: CreateLiveEventDto): Promise<any> {
    const uid = Math.floor(Math.random() * 100000).toString();
    const channelName = `event_${Date.now()}`;

    const rtcData = await this.generateRtcToken(channelName, uid);
    const rtmData = await this.generateRtmToken(uid);

    return this.prisma.liveEvent.create({
      data: {
        ...dto,
        userId,
        channelName,
        uid,
        rtcToken: (rtcData as any)?.rtcToken,
        rtmToken: (rtmData as any)?.rtmToken,
      },
    });
  }

  // Get all live events
  @HandleError('Failed to get live events')
  async getLiveEvents() {
    return this.prisma.liveEvent.findMany({
      include: { user: true },
      orderBy: { startTime: 'asc' },
    });
  }
}
