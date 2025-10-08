import { successResponse } from 'src/common/utils/response.util';
import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'src/lib/prisma/prisma.service';
import { CommentStatus, ReportStatus, Status } from '@prisma/client';
import { HandleError } from 'src/common/error/handle-error.decorator';
import { PaymentPlanDto } from '../dto/payment-plane.dto';
import { NotificationGateway } from 'src/lib/notificaton/notification.gateway';

@Injectable()
export class ContentmanageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationGateway: NotificationGateway,
  ) {}
  // -------------update content status-------------
  @HandleError('Failed to update content status', 'contentmanage')
  async updateContentStatus(id: string, status: Status): Promise<any> {
    const updated = await this.prisma.content.update({
      where: { id },
      data: { status },
      select: {
        status: true,
        image: true,
        userId: true,
        title: true,
        subTitle: true,
      },
    });

    // Create a notification in DB
    const notification = await this.prisma.notification.create({
      data: {
        type: 'contentStatus',
        title: 'Content Status Updated',
        message: `Content status updated to ${status}`,
        meta: {
          contentId: id,
          authorId: updated.userId,
          contentSubtitle: updated.subTitle,
          contentImage: updated.image,
          contentTitle: updated.title,
          contentStatus: updated.status,
          newStatus: status,
          previousStatus: updated.status,
          updatedAt: new Date().toISOString(),

          status,
          date: new Date().toISOString(),
        },
      },
    });

    // If APPROVE → notify all users
    if (status === Status.APPROVE) {
      const users = await this.prisma.user.findMany({
        select: { id: true },
      });
      const userIds = users.map((u) => u.id);

      // Create UserNotification records
      await this.prisma.userNotification.createMany({
        data: userIds.map((userId) => ({
          userId,
          notificationId: notification.id,
        })),
        skipDuplicates: true,
      });

      // Push via WebSocket
      await this.notificationGateway.notifyAllUsers('contentStatus', {
        title: notification.title,
        message: notification.message,
        meta: notification.meta,
      } as any);
    } else {
      // Else → only notify content owner
      const content = await this.prisma.content.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (content?.userId) {
        await this.prisma.userNotification.create({
          data: {
            userId: content.userId,
            notificationId: notification.id,
          },
        });

        await this.notificationGateway.notifySingleUser(
          content.userId,
          'contentStatus',
          {
            title: notification.title,
            body: notification.message,
            meta: notification.meta,
          } as any,
        );
      }
    }

    return {
      success: true,
      message: `Content status updated to ${status}`,
      data: updated,
    };
  }

  // --------------get all content with super admin ------------

  @HandleError('Failed to get all content', 'contentmanage')
  async getAllContentSuperadmin(): Promise<any> {
    return this.prisma.content.findMany({
      where: { isDeleted: false },
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
  // ---------------- get pending content  --------------
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

  // --------get all plans-------------------
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

  // -----------get all report super admin---------------------
  @HandleError('Failed to get all reports', 'Report')
  async getAllReports() {
    const reports = await this.prisma.reportContent.findMany({
      where: { isDeleted: false },
      include: {
        // -----  Reporter (the user who reported)---------
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true,
            role: true,
          },
        },
        // -------  Reported content info---------
        content: {
          select: {
            id: true,
            title: true,
            paragraph: true,
            contentType: true,
            createdAt: true,
            // ---------- Content owner info-----------------
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                profilePhoto: true,
                role: true,
              },
            },
          },
        },

        images: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse(reports, 'All reports retrieved successfully');
  }
  // ------get getSingleReport------
  async getSingleReport(id: string) {
    const report = await this.prisma.reportContent.findUnique({
      where: { id, isDeleted: false },
      include: {
        // -----  Reporter (the user who reported)---------
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true,
            role: true,
          },
        },
        // -------  Reported content info---------
        content: {
          select: {
            id: true,
            title: true,
            paragraph: true,
            contentType: true,
            createdAt: true,
            // ---------- Content owner info-----------------
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                profilePhoto: true,
                role: true,
              },
            },
          },
        },

        images: true,
      },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return successResponse(report, 'Report retrieved successfully');
  }
  // -------- report content delete -----------
  @HandleError('Failed to delete reported content', 'Report')
  async deleteReportedContent(reportId: string) {
    const report = await this.prisma.reportContent.findUnique({
      where: { id: reportId, isDeleted: false },
      select: { contentId: true },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    // Soft delete the reported content
    const deletedContent = await this.prisma.content.update({
      where: { id: report.contentId },
      data: { isDeleted: true },
    });

    // Optionally, you can also delete the report itself
    await this.prisma.reportContent.delete({
      where: { id: reportId },
    });

    return {
      success: true,
      message: 'Reported content deleted successfully',
      data: deletedContent,
    };
  }
  // -------status update for report----------
  @HandleError('Failed to update report status', 'Report')
  async updateReportStatus(reportId: string, status: ReportStatus) {
    const report = await this.prisma.reportContent.findUnique({
      where: { id: reportId },
      select: { id: true },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    const updatedReport = await this.prisma.reportContent.update({
      where: { id: reportId },
      data: { status },
    });

    return {
      success: true,
      message: `Report status updated to ${status}`,
      data: updatedReport,
    };
  }

  // -----soft delete report------
  async softDeleteReportContent(reportId: string) {
    const report = await this.prisma.reportContent.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    const softDeletedReport = await this.prisma.reportContent.update({
      where: { id: reportId },
      data: { isDeleted: true },
    });

    return {
      success: true,
      message: 'Report soft deleted successfully',
      data: softDeletedReport,
    };
  }
  // -------hate space maintain-------
  @HandleError('Failed to get all hate space', 'HateSpace')
  async getAllHateSpace() {
    const hateSpace = await this.prisma.content.findMany({
      where: {
        evaluationResult: { not: null },
        isDeleted: false,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true,
            role: true,
          },
        },
      },
    });

    // Format response
    const formatted = hateSpace
      .map((content) => {
        let evaluation;
        try {
          evaluation = content.evaluationResult
            ? JSON.parse(content.evaluationResult)
            : null;
          // evaluation_result is nested JSON string
          if (evaluation?.evaluation_result) {
            evaluation.evaluation_result = JSON.parse(
              evaluation.evaluation_result,
            );
          }
        } catch (e) {
          evaluation = {
            evaluation_result: { percentage: 0, lines: [] },
            success: false,
          };
        }

        return {
          title: content.title,
          subTitle: content.subTitle,
          author: content.user
            ? {
                id: content.user.id,
                fullName: content.user.fullName || 'Unknown User',
                profilePhoto: content.user.profilePhoto || null,
                role: content.user.role,
              }
            : null,
          percentage: evaluation?.evaluation_result?.percentage ?? 0,
          lines: evaluation?.evaluation_result?.lines ?? [],
        };
      })
      // Filter out content with percentage >= 98
      .filter((c) => c.percentage < 98);

    return {
      success: true,
      message: 'All hate space retrieved successfully',
      data: formatted,
    };
  }

  // -------soft deleted content---------
  @HandleError('Failed to soft delete content', 'Content')
  async softDeleteContent(contentId: string) {
    const content = await this.prisma.content.update({
      where: { id: contentId },
      data: { isDeleted: true },
    });

    return {
      success: true,
      message: 'Content soft deleted successfully',
      data: {
        id: content.id,
        title: content.title,
        isDeleted: content.isDeleted,
      },
    };
  }

  // -------hate speech comment---

  @HandleError('Failed to get all hate speech comments', 'HateSpeechComment')
  async getAllHateSpeechComments() {
    const hateSpeechComments = await this.prisma.comment.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true,
            role: true,
          },
        },
      },
    });

    return successResponse(
      hateSpeechComments,
      'All hate speech comments retrieved successfully',
    );
  }

  // ---------------- Get all hate comments ----------------
  @HandleError('Failed to get all hate comments', 'HateComment')
  async getAllHateComments() {
    const comments = await this.prisma.comment.findMany({
      where: { hate_speech_detect: true, isDeleted: false },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      message: 'Hate comments retrieved successfully',
      data: comments,
    };
  }

  // ---------------- Approve hate comment ----------------
  @HandleError('Failed to approve hate comment', 'HateComment')
  async approveHateComment(commentId: string) {
    const existing = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!existing || !existing.hate_speech_detect || existing.isDeleted) {
      throw new NotFoundException('Hate comment not found');
    }

    const updated = await this.prisma.comment.update({
      where: { id: commentId },
      data: {
        status: CommentStatus.APPROVE,
        hate_speech_detect: false,
        confidence: null,
        explanation: null,
      },
    });

    return {
      success: true,
      message: 'Hate comment approved successfully',
      data: updated,
    };
  }

  // ---------------- Soft delete hate comment ----------------
  @HandleError('Failed to soft delete hate comment', 'HateComment')
  async softDeleteHateComment(commentId: string) {
    const existing = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!existing || !existing.hate_speech_detect || existing.isDeleted) {
      throw new NotFoundException('Hate comment not found');
    }

    const deleted = await this.prisma.comment.update({
      where: { id: commentId },
      data: { isDeleted: true, status: CommentStatus.Declined },
    });

    return {
      success: true,
      message: 'Hate comment soft deleted successfully',
      data: deleted,
    };
  }
  // ------------------------- get pending contents by contentType -------------------------
  @HandleError(
    'Failed to get pending contents by content type',
    'contentmanage',
  )
  async getPendingContentsByTypesuperadmin(): Promise<any> {
    const contents = await this.prisma.content.findMany({
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

    // Group by contentType
    const grouped = contents.reduce(
      (acc, content) => {
        const type = content.contentType;
        if (!acc[type]) acc[type] = [];
        acc[type].push(content);
        return acc;
      },
      {} as Record<string, any[]>,
    );

    return grouped;
  }

  // ------------------------- get approved contents by contentType -------------------------
  @HandleError(
    'Failed to get approved contents by content type',
    'contentmanage',
  )
  async getApprovedContentsByTypesuperadmin(): Promise<any> {
    const contents = await this.prisma.content.findMany({
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

    const grouped = contents.reduce(
      (acc, content) => {
        const type = content.contentType;
        if (!acc[type]) acc[type] = [];
        acc[type].push(content);
        return acc;
      },
      {} as Record<string, any[]>,
    );

    return grouped;
  }

  @HandleError(
    'Failed to get declined contents by content type',
    'contentmanage',
  )
  async getDeclinedContentsByTypesuperadmin(): Promise<any> {
    const contents = await this.prisma.content.findMany({
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

    const grouped = contents.reduce(
      (acc, content) => {
        const type = content.contentType;
        if (!acc[type]) acc[type] = [];
        acc[type].push(content);
        return acc;
      },
      {} as Record<string, any[]>,
    );

    return grouped;
  }
}
