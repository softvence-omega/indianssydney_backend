import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { CreateTotalPageViewDto } from '../dto/create-page-view.dto';
import { HandleError } from 'src/common/error/handle-error.decorator';
import { TResponse } from 'src/common/utils/response.util';

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

  @HandleError('Editor content activity  user manage overview')
  async editorContentActivity(): Promise<TResponse<any>> {
    const EditorContentActivity =
      await this.prisma.contentStatusHistory.findMany({
        orderBy: { changedAt: 'desc' },
        take: 10,
      });

    return {
      success: true,
      message: 'Editor content activity fetched successfully',
      data: EditorContentActivity,
    };
  }
}
