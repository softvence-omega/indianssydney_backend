import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { CreateTotalPageViewDto } from '../dto/create-page-view.dto';
import { HandleError } from 'src/common/error/handle-error.decorator';
import { TResponse } from 'src/common/utilsResponse/response.util';

@Injectable()
export class OverviewDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // ----------Increment total view------------------
  @HandleError('increament pageview error')
  async increment(dto: CreateTotalPageViewDto) {
    const incrementValue = dto.increment ?? 1;

    let total = await this.prisma.totalPageview.findFirst();
    if (total) {
      total = await this.prisma.totalPageview.update({
        where: { id: total.id },
        data: { count: total.count + incrementValue },
      });
    } else {
      total = await this.prisma.totalPageview.create({
        data: { count: incrementValue },
      });
    }

    return total;
  }

  // ----------------get total view with groth--------------------------------------

  @HandleError('super admin can total get view user')
  async getTotalWithBonus() {
    const now = new Date();

    // Last month
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
    );

    // Current month
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfCurrentMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    // -------------- Page views last month ----------------
    const lastMonthViews = await this.prisma.totalPageview.aggregate({
      _sum: { count: true },
      where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
    });
    const lastMonthCount = lastMonthViews._sum.count ?? 0;

    //--------------- Page views current month-------------------
    const currentMonthViews = await this.prisma.totalPageview.aggregate({
      _sum: { count: true },
      where: {
        createdAt: { gte: startOfCurrentMonth, lte: endOfCurrentMonth },
      },
    });
    const currentMonthCount = currentMonthViews._sum.count ?? 0;

    // ---------page Groth percentage-----------------
    let pageGroth: number;

    if (lastMonthCount === 0) {
      pageGroth = currentMonthCount;
    } else {
      pageGroth = Math.round(
        ((currentMonthCount - lastMonthCount) / lastMonthCount) * 100,
      );
    }

    // ===== Content stats =====

    // Get last month content count
    const lastMonthContentCount = await this.prisma.content.count({
      where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
    });

    // Get current month content count
    const currentMonthContentCount = await this.prisma.content.count({
      where: {
        createdAt: { gte: startOfCurrentMonth, lte: endOfCurrentMonth },
      },
    });

    // Get total content (all time)
    const totalContentCount = await this.prisma.content.count();

    // Calculate growth percentage
    const contentGrowthPercentage =
      lastMonthContentCount === 0
        ? currentMonthContentCount > 0
          ? 100
          : 0
        : Math.round(
            ((currentMonthContentCount - lastMonthContentCount) /
              lastMonthContentCount) *
              100,
          );

    // ======= Article stats =======
    const [
      totalArticleCurrentMonth,
      totalArticleLastMonthPending,
      totalArticles,
    ] = await Promise.all([
      this.prisma.content.count({
        where: {
          createdAt: { gte: startOfCurrentMonth, lte: endOfCurrentMonth },
        },
      }),
      this.prisma.content.count({
        where: {
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
          status: 'PENDING',
        },
      }),
      this.prisma.content.count(),
    ]);

    // Current total
    const total = await this.prisma.totalPageview.findFirst();
    const baseCount = total?.count ?? 1;

    return {
      totalArticleCurrentMonth,
      totalArticleLastMonthPending,
      totalArticles,
      contentGrowthPercentage,
      baseCount,
      lastMonthCount,
      currentMonthCount,
      pageGroth,
    };
  }

  // ----------------------total user----------------

  @HandleError('super admin can total get last month users')
  async getTotalUserLastMonth() {
    const now = new Date();

    // Last month
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
    );

    //----------------- Current month------------
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfCurrentMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    const totalLastMonth = await this.prisma.user.count({
      where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
    });

    const totalCurrentMonth = await this.prisma.user.count({
      where: {
        createdAt: { gte: startOfCurrentMonth, lte: endOfCurrentMonth },
      },
    });
    // -----------get calculate pageGroth percentage-----------------
    let userGrowth: number;

    if (totalLastMonth === 0 && totalCurrentMonth === 0) {
      userGrowth = 0;
    } else if (totalLastMonth === 0) {
      userGrowth = totalCurrentMonth;
    } else {
      userGrowth = Math.round(
        ((totalCurrentMonth - totalLastMonth) / totalLastMonth) * 100,
      );
    }

    return { totalLastMonth, totalCurrentMonth, userGrowth };
  }

  // ---------total user acitvity------------

  @HandleError('Super admin can total get view user role')
  async getTotalUserActivity() {
    // Total users
    const totalUser = await this.prisma.user.count();

    // Total page views
    const totalPageView = await this.prisma.totalPageview.findFirst();
    const totalPageViewCount = totalPageView?.count ?? 0;

    // Users by role
    const userRoles = await this.prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
    });

    // Map role counts to desired keys
    const roleCounts = {
      visitorCount: 0,
      adminCount: 0,
      contributorCount: 0,
      memberCount: 0,
      superAdminCount: 0,
    };

    userRoles.forEach((r) => {
      switch (r.role) {
        case 'USER':
          roleCounts.visitorCount = r._count.role;
          break;
        case 'ADMIN':
          roleCounts.adminCount = r._count.role;
          break;
        case 'CONTIBUTOR':
          roleCounts.contributorCount = r._count.role;
          break;
        case 'MEMBER':
          roleCounts.memberCount = r._count.role;
          break;
        case 'SUPER_ADMIN':
          roleCounts.superAdminCount = r._count.role;
          break;
      }
    });

    // Calculate percentages
    const percentages = {
      visitorPercentage: totalUser
        ? (roleCounts.visitorCount / totalUser) * 100
        : 0,
      adminPercentage: totalUser
        ? (roleCounts.adminCount / totalUser) * 100
        : 0,
      contributorPercentage: totalUser
        ? (roleCounts.contributorCount / totalUser) * 100
        : 0,
      memberPercentage: totalUser
        ? (roleCounts.memberCount / totalUser) * 100
        : 0,
      superAdminPercentage: totalUser
        ? (roleCounts.superAdminCount / totalUser) * 100
        : 0,
    };

    return {
      totalUser,
      totalPageViewCount,
      ...roleCounts,
      ...percentages,
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

  // ----------------- Editor content activity -----------------------
  @HandleError('Editor content activity user manage overview')
  async editorContentActivity(): Promise<TResponse<any>> {
    const EditorContentActivity =
      await this.prisma.contentStatusHistory.findMany({
        orderBy: { changedAt: 'desc' },
        take: 10,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
              profilePhoto: true,
            },
          },
          content: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
      });

    return {
      success: true,
      message: 'Editor content activity fetched successfully',
      data: EditorContentActivity,
    };
  }

  // -------------------analytics overview-------------------
  @HandleError('Failed to get analytics overview')
  async analyticsDashboardTags() {
    const tagsData = await this.prisma.aiSeoTag.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { tags: true },
    });

    const allTags = tagsData.flatMap((item) => item.tags || []);

    const tagCounts: Record<string, number> = {};
    for (const tag of allTags) {
      const normalized = tag.trim().toLowerCase();
      tagCounts[normalized] = (tagCounts[normalized] || 0) + 1;
    }

    // 4️⃣ Sort by frequency and take top 6
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name]) => name);

    return {
      success: true,
      message: 'Top 6 tags fetched successfully',
      data: topTags,
    };
  }
  // ---contentMetrics for dashboard
  @HandleError('Failed to get content metrics overview')
  async contentMetrics() {
    const contents = await this.prisma.content.findMany({
      where: { isDeleted: false },
      select: { compareResult: true },
    });

    // Extract performance percentage from JSON string
    const aiPerformance = contents
      .map((item) => {
        try {
          const parsed = JSON.parse(item.compareResult || '{}');
          return parsed.percentage_not_aligned ?? null;
        } catch {
          return null;
        }
      })
      .filter((p) => p !== null);

    // Calculate average percentage
    const averagePerformance =
      aiPerformance.length > 0
        ? aiPerformance.reduce((a, b) => a + b, 0) / aiPerformance.length
        : 0;

    return {
      success: true,
      message: 'AI performance metrics fetched successfully',
      data: {
        averagePerformance: Number(averagePerformance.toFixed(2)),
        allPerformances: aiPerformance,
      },
    };
  }
  // --------------- User Engagement & Personalization -----------------------
  @HandleError('Failed to get user engagement & personalization overview')
  async getUserEngagementPersonalization(period: string = 'all') {
    const now = new Date();
    let sinceDate: Date | null = null;

    switch (period) {
      case 'week':
        sinceDate = new Date(now);
        sinceDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        sinceDate = new Date(now);
        sinceDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        sinceDate = new Date(now);
        sinceDate.setMonth(now.getMonth() - 3);
        break;
      case 'all':
      default:
        sinceDate = null; // No filter
    }

    const whereClause = sinceDate ? { createdAt: { gte: sinceDate } } : {};

    // Fetch counts
    const [totalUsers, totalBookmarks, totalComments, totalReactions] =
      await Promise.all([
        this.prisma.user.count({ where: whereClause }),
        this.prisma.bookmark.count({ where: whereClause }),
        this.prisma.contentComment.count({ where: whereClause }),
        this.prisma.contentReaction.count({ where: whereClause }),
      ]);

    // Fetch totals for average growth calculation (compared to previous period)
    let previousPeriodWhere: any = null;
    if (sinceDate) {
      const periodDiffDays = Math.ceil(
        (now.getTime() - sinceDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      const prevStart = new Date(sinceDate);
      prevStart.setDate(sinceDate.getDate() - periodDiffDays);
      const prevEnd = new Date(sinceDate);
      previousPeriodWhere = { createdAt: { gte: prevStart, lt: prevEnd } };
    }

    const [prevUsers, prevBookmarks, prevComments, prevReactions] =
      previousPeriodWhere
        ? await Promise.all([
            this.prisma.user.count({ where: previousPeriodWhere }),
            this.prisma.bookmark.count({ where: previousPeriodWhere }),
            this.prisma.contentComment.count({ where: previousPeriodWhere }),
            this.prisma.contentReaction.count({ where: previousPeriodWhere }),
          ])
        : [0, 0, 0, 0];

    // Calculate growth %
    const calcGrowth = (current: number, prev: number) =>
      prev === 0 ? 0 : ((current - prev) / prev) * 100;

    const averageGrowth =
      (calcGrowth(totalUsers, prevUsers) +
        calcGrowth(totalBookmarks, prevBookmarks) +
        calcGrowth(totalComments, prevComments) +
        calcGrowth(totalReactions, prevReactions)) /
      4;

    return {
      totalUsers,
      totalBookmarks,
      totalComments,
      totalReactions,
      averageGrowth: Number(averageGrowth.toFixed(2)),
    };
  }

  // ------------------ getCommunityModerationAI -------------------
  @HandleError('Failed to get community moderation AI overview')
  async getCommunityModerationAIOverview() {
    // Fetch all community posts with comments
    const communityPosts = await this.prisma.communityPost.findMany({
      select: { comments: true },
    });

    // Fetch AI moderation results from content
    const contentResults = await this.prisma.content.findMany({
      select: { compareResult: true },
    });

    // Initialize counters
    let articlesScanned = 0;
    let flaggedForReview = 0;
    let hateSpeechRemoved = 0;

    // Process community post comments
    communityPosts.forEach((post) => {
      articlesScanned += 1;
      flaggedForReview += post.comments.filter((c) => c.explanation).length;
      hateSpeechRemoved += post.comments.filter((c) => c.confidence).length;
      articlesScanned += post.comments.length;
    });

    // Process AI moderation results from content
    contentResults.forEach((item) => {
      articlesScanned += 1; // Count each content item
      try {
        const parsed = JSON.parse(item.compareResult || '{}');

        if ((parsed.percentage_not_aligned ?? 0) > 0) flaggedForReview += 1;
        if (parsed.hate_speech_removed) hateSpeechRemoved += 1;
      } catch {
        // Ignore invalid JSON
      }
    });

    return {
      success: true,
      data: {
        articlesScanned,
        flaggedForReview,
        hateSpeechRemoved,
      },
    };
  }
}
