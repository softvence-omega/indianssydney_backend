import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HandleError } from 'src/common/error/handle-error.decorator';
import { MailService } from 'src/lib/mail/mail.service';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { CreateSubscribeDto } from '../dto/create-subscribe.dto';
import { successResponse, TResponse } from 'src/common/utils/response.util';
import { ENVEnum } from 'src/common/enum/env.enum';
import { AppError } from 'src/common/error/handle-error.app';
import { PaginationDto } from 'src/common/dto/pagination';
import { UpdateSubscribeDto } from '../dto/update-subscribe.dto';
import { NotificationService } from 'src/main/notification/service/notification.service';

@Injectable()
export class SubscribeService {
  private readonly logger = new Logger(SubscribeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private notificationService: NotificationService,
  ) {}

  @HandleError('Failed to create subscribe', 'subscribe')
  async create(payload: CreateSubscribeDto): Promise<TResponse<any>> {
    const subscribe = await this.prisma.subscribe.create({
      data: { ...payload },
    });

    // Get admin email
    const adminEmail = this.configService.get<string>(ENVEnum.MAIL_USER);
    if (!adminEmail) {
      this.logger.error('MAIL_USER not configured in environment');
      throw new AppError(400, 'Admin email not configured');
    }

    const adminSubject = ` New subscribe Form Submission`;
    const adminMessage = `
      <h3>New subscribe Message</h3>
   
      <p><strong>Email:</strong> ${payload.email}</p>
     
    `;

    await this.mailService.sendEmail(adminEmail, adminSubject, adminMessage);
    // ----------user email----------
    const userSubject = ` We Received Your Message`;
    const userMessage = `
      <h3> ${payload.email},</h3>
     
      <hr/>
       <p>Thank you for subscribing </p>
    
    `;

    await this.mailService.sendEmail(payload.email, userSubject, userMessage);

    // ---------notofication---------

    await this.notificationService.broadcastToAll({
      title: 'New Course Available!',
      body: `${payload.email} has been added. Check it out now!`,
      contentType: 'subcribe',
      contentId: payload.email,
    });

    return successResponse(subscribe, 'subscribe created successfully');
  }

  @HandleError('Failed to fetch subscribe', 'Neswlatter')
  async findAll(query: PaginationDto): Promise<TResponse<any>> {
    const page = query.page || 1;
    const limit = query.limit && query.limit >= 0 ? query.limit : 10;

    const subscribes = await this.prisma.subscribe.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return successResponse(subscribes, 'subscribe fetched successfully');
  }
  // ------------get subscribe by id for admin----------------
  @HandleError('Failed to fetch subscribe ', 'subscribe')
  async findOne(id: string): Promise<TResponse<any>> {
    const subscribe = await this.prisma.subscribe.findUnique({
      where: { id },
    });
    if (!subscribe) {
      throw new AppError(400, `No subscribe found with ID: ${id}`);
    }
    return successResponse(subscribe, 'subscribe fetched successfully');
  }
  // ------------------ update subscribe by id for admin----------------
  @HandleError('Failed to update subscribe', 'subscribe')
  async update(id: string, dto: UpdateSubscribeDto): Promise<TResponse<any>> {
    await this.ensureExists(id);
    const subscribe = await this.prisma.subscribe.update({
      where: { id },
      data: { ...dto },
    });

    return successResponse(subscribe, 'subscribe updated successfully');
  }

  @HandleError('Failed to delete subscribe', 'subscribe')
  async remove(id: string): Promise<TResponse<any>> {
    await this.ensureExists(id);
    const subscribe = await this.prisma.subscribe.delete({ where: { id } });
    await this.notificationService.broadcastToAll({
      title: 'Subscription Removed',
      body: `${subscribe.email} has been removed from subscriptions.`,
      contentType: 'subcribe',
      contentId: subscribe.id,
    });
    return successResponse(subscribe, 'subscribe deleted successfully');
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.subscribe.findUnique({ where: { id } });
    if (!exists) {
      throw new AppError(400, `subscribe with ID ${id} does not exist`);
    }
  }
}
