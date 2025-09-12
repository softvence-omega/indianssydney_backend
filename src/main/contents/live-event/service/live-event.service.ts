import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { CreateLiveEventDto } from '../dto/create-live-event.dto';
import { RtcRole, RtcTokenBuilder, RtmTokenBuilder } from 'agora-access-token';
import { HandleError } from 'src/common/error/handle-error.decorator';

@Injectable()
export class LiveEventService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly appId = process.env.AGORA_APP_ID;
  private readonly appCertificate = process.env.AGORA_APP_CERTIFICATE;

  // ---------------- Generate RTC Token ----------------
  async generateRtcToken(channelName: string, uid: string) {
    if (!this.appId || !this.appCertificate) {
      throw new Error('Agora credentials not configured');
    }

    const expirationTimeInSeconds = 3600; 
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
      this.appId,
      this.appCertificate,
      channelName,
      Number(uid),
      RtcRole.PUBLISHER, // host can publish & subscribe
      privilegeExpiredTs,
    );
    return token;
  }

  // ---------------- Generate RTM Token ----------------
  async generateRtmToken(uid: string) {
    if (!this.appId || !this.appCertificate) {
      throw new Error('Agora credentials not configured');
    }

    const expirationTimeInSeconds = 3600; 
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const token = RtmTokenBuilder.buildToken(
      this.appId,
      this.appCertificate,
      uid,
      RtcRole.PUBLISHER,
      privilegeExpiredTs,
    );
    return token;
  }

  // ---------------- Create Live Event ----------------
  @HandleError('Failed to create live event')
  async createLiveEvent(userId: string, dto: CreateLiveEventDto): Promise<any> {
    const uid = Math.floor(Math.random() * 100000).toString();
    const channelName = `event_${Date.now()}`;

    const rtcToken = await this.generateRtcToken(channelName, uid);
    const rtmToken = await this.generateRtmToken(uid);

    return this.prisma.liveEvent.create({
      data: {
        ...dto,
        userId,
        channelName,
        uid,
        rtcToken,
        rtmToken,
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
}
