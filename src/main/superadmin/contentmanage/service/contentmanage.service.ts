import { successResponse } from 'src/common/utils/response.util';
import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/lib/prisma/prisma.service';
import { Status } from '@prisma/client';
import { HandleError } from 'src/common/error/handle-error.decorator';
import { PaymentPlanDto } from '../dto/payment-plane.dto';

@Injectable()
export class ContentmanageService {
  constructor(private readonly prisma: PrismaService) {}
  @HandleError('Failed to update content status', 'contentmanage')
  async updateContentStatus(id: string, status: Status): Promise<any> {
    const updated = await this.prisma.content.update({
      where: { id },
      data: { status },
    });

    return {
      success: true,
      message: `Content status updated to ${status}`,
      data: updated,
    };
  }
  // --------------- get recent content  --------------
  @HandleError('Failed to get recent contents', 'contentmanage')
  async getRecentContent(): Promise<any> {
    return this.prisma.content.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' },
      take: 14,
      include: {
        user: {
          select: { id: true, fullName: true, email: true, profilePhoto: true },
        },
        category: { select: { id: true, name: true, slug: true } },
        subCategory: { select: { id: true, subname: true, subslug: true } },
      },
    });
  }

  @HandleError('Failed to get pending contents', 'contentmanage')
  async getPendingContents(): Promise<any> {
    return this.prisma.content.findMany({
      where: { status: Status.PENDING, isDeleted: false },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, profilePhoto: true },
        },
        category: { select: { id: true, name: true, slug: true } },
        subCategory: { select: { id: true, subname: true, subslug: true } },
      },
    });
  }

  @HandleError('Failed to get approved contents', 'contentmanage')
  async getApprovedContents(): Promise<any> {
    return this.prisma.content.findMany({
      where: { status: Status.APPROVE, isDeleted: false },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, profilePhoto: true },
        },
        category: { select: { id: true, name: true, slug: true } },
        subCategory: { select: { id: true, subname: true, subslug: true } },
      },
    });
  }

  @HandleError('Failed to get declined contents', 'contentmanage')
  async getDeclinedContents(): Promise<any> {
    return this.prisma.content.findMany({
      where: { status: Status.Declined, isDeleted: false },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, profilePhoto: true },
        },
        category: { select: { id: true, name: true, slug: true } },
        subCategory: { select: { id: true, subname: true, subslug: true } },
      },
    });
  }

  // ------------------
  findAll() {
    return `This action returns all contentmanage`;
  }

  // -------------plane payment---

  @HandleError('Failed to create payment plan', 'contentmanage')
  async createPlan(dto:PaymentPlanDto ): Promise<any> {
    const { price, ...rest } = dto;
    const plan = await this.prisma.paymentplan.create({
      data: {
        ...rest,
        Price: price.toString(),
      },
    });

    return successResponse(plan, 'Payment plan created successfully');
  }
}
