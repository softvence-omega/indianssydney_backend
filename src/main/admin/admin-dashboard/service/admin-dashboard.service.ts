import { Injectable } from '@nestjs/common';
import { CreateAdminDashboardDto } from '../dto/create-admin-dashboard.dto';
import { UpdateAdminDashboardDto } from '../dto/update-admin-dashboard.dto';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { HandleError } from 'src/common/error/handle-error.decorator';
import { TResponse } from 'src/common/utils/response.util';

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // ------------------admin dashboard overview--------------------
  @HandleError('Failed to get admin dashboard overview', 'admin-dashboard')
  async getAdminDashboardOverview(): Promise<any> {
    // User counts
    const totalContributorRole = await this.prisma.user.count({
      where: { isDeleted: false, role: 'CONTIBUTOR' },
    });

    // Content counts
    const contentPublished = await this.prisma.content.count({
      where: { status: 'APPROVE', isDeleted: false },
    });

    const contentPending = await this.prisma.content.count({
      where: { status: 'PENDING', isDeleted: false },
    });

    // AI counts
    const totalAiParagraphs = await this.prisma.aiParagraphGeneration.count();
    const totalAiSeoTags = await this.prisma.aiSeoTag.count();

    const totalAiPerformance = totalAiParagraphs + totalAiSeoTags;

    return {
      success: true,
      message: 'Admin dashboard overview fetched successfully',
      data: {
        users: {
          contributors: totalContributorRole,
        },
        content: {
          published: contentPublished,
          pending: contentPending,
        },
        aiPerformance: {
          total: totalAiPerformance,
          paragraphs: totalAiParagraphs,
          seoTags: totalAiSeoTags,
        },
      },
    };
  }

  //----------------- traffic & engagement overview  ----------------------------
  @HandleError('Failed to get traffic & engagement overview')
  async trafficEngagement() {
    // ----------------- Total post created -----------------
    const totalPosts = await this.prisma.content.count();

    // ----------------- Monthly posts created -----------------
    const postCreateByMonth = await this.prisma.content.groupBy({
      by: ['createdAt'],
      _count: { id: true },
      orderBy: { createdAt: 'asc' },
    });

    // ----------------- Format monthly data -----------------
    function formatMonthly(
      data: { createdAt: Date; _count: { id: number } }[],
    ) {
      return data.reduce<Record<string, number>>((acc, item) => {
        const monthName = item.createdAt.toLocaleString('en-US', {
          month: 'long',
          year: 'numeric',
        });
        acc[monthName] = (acc[monthName] ?? 0) + item._count.id;
        return acc;
      }, {});
    }

    return {
      overviewEngagement: {
        totalPosts,
      },
      monthly: {
        posts: formatMonthly(postCreateByMonth),
      },
    };
  }

  // ----------------- Recent Activity -----------------------
  @HandleError('Failed to get recent activity overview')
  async recentActivity(): Promise<TResponse<any>> {
    const activities = await this.prisma.content.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: {
          select: { fullName: true, email: true },
        },
      },
    });

    const formatted = activities.map((activity) => {
      const userName =
        activity.user?.fullName && activity.user.fullName.trim() !== ''
          ? activity.user.fullName
          : 'Unknown User';

      return {
        message: `${userName} submitted "${activity.title}"`,
        time: new Date(activity.createdAt).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
    });

    return {
      success: true,
      message: 'Recent activities fetched successfully',
      data: formatted,
    };
  }

  // ----to per performance with views------

  @HandleError('Failed to get top performance overview')
  async topPerformance(): Promise<TResponse<any>> {
    const topContents = await this.prisma.content.findMany({
      where: { isDeleted: false },
      orderBy: { contentviews: 'desc' },
      take: 10,
      include: {
        user: {
          select: { fullName: true, email: true, profilePhoto: true },
        },
      },
    });

    const formatted = topContents.map((content) => {
      const user = content.user;
      const userName =
        user?.fullName && user.fullName.trim() !== ''
          ? user.fullName
          : 'Unknown User';

      return {
        title: content.title,
        views: content.contentviews,
        author: userName,
        email: user?.email || null,
        profilePhoto: user?.profilePhoto || null, 
      };
    });

    return {
      success: true,
      message: 'Top performance fetched successfully',
      data: formatted,
    };
  }

  @HandleError('Failed top contributor content contentHistory')
  async contentHistory(): Promise<TResponse<any>> {
    const topContributors = await this.prisma.user.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        fullName: true,
        profilePhoto: true,
        constents: {
          // Use the correct relation name from your Prisma schema
          where: { status: 'APPROVE', isDeleted: false },
          select: {
            id: true,
            contentviews: true,
          },
        },
      },
    });

    const formatted = topContributors
      .map((user) => {
        const totalPublished = user.constents.length;
        const totalViews = user.constents.reduce(
          (sum, c) => sum + (c.contentviews || 0),
          0,
        );

        return {
          name: user.fullName || 'Unknown User',
          profilePhoto: user.profilePhoto || null,
          totalPublished,
          totalViews,
        };
      })
      .sort((a, b) => b.totalPublished - a.totalPublished)
      .slice(0, 10);

    return {
      success: true,
      message: 'Top 10 contributors fetched successfully',
      data: formatted,
    };
  }


  
}
