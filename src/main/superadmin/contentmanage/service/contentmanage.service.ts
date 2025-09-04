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

  // -------------plane payment-------------

  @HandleError('Failed to create payment plan', 'contentmanage')
  async createPlan(payload: PaymentPlanDto): Promise<any> {
    const plan = await this.prisma.paymentplan.create({
      data: {
        name: payload.name,
        Price: payload.Price || 0,
        billingCycle: payload.billingCycle,
        shortBio: payload.shortBio,
        features: payload.features,
      },
    });

    return successResponse(plan, 'Payment plan created successfully');
  }

  // --------get all plans
  @HandleError('Failed to get payment plans', 'contentmanage')
  async getAllPlans(): Promise<any> {
    const plans = await this.prisma.paymentplan.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(plans, 'Payment plans retrieved successfully');
  }

  // ==========update plan=================
  @HandleError('Failed to update payment plan', 'contentmanage')
  async updatePlan(id: string, payload: PaymentPlanDto): Promise<any> {
    const existingPlan = await this.prisma.paymentplan.findUnique({
      where: { id },
    });
    if (!existingPlan) {
      return {
        success: false,
        message: 'Payment plan not found',
      };
    }
    const updatedPlan = await this.prisma.paymentplan.update({
      where: { id },
      data: {
        name: payload.name,
        Price: payload.Price || existingPlan.Price,
        billingCycle: payload.billingCycle,
        shortBio: payload.shortBio,

        features: payload.features,
      },
    });
    return successResponse(updatedPlan, 'Payment plan updated successfully');
  }

  // // ==========get single plan=================
  @HandleError('Failed to get payment plan', 'contentmanage')
  async getSinglePlan(id: string): Promise<any> {
    const plan = await this.prisma.paymentplan.findUnique({
      where: { id },
    });
    if (!plan) {
      return {
        success: false,
        message: 'Payment plan not found',
      };
    }
    return successResponse(plan, 'Payment plan retrieved successfully');
  }

  // ==========delete plan=================
  @HandleError('Failed to delete payment plan', 'contentmanage')
  async deletePlan(id: string): Promise<any> {
    const existingPlan = await this.prisma.paymentplan.findUnique({
      where: { id },
    });
    if (!existingPlan) {
      return {
        success: false,
        message: 'Payment plan not found',
      };
    }
    const subcategory = await this.prisma.paymentplan.delete({
      where: { id },
    });
    return successResponse(subcategory, 'Payment plan deleted successfully');
  }
}
