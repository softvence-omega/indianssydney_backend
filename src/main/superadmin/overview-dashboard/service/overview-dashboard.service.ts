import { Injectable } from '@nestjs/common';
import { UpdateOverviewDashboardDto } from '../dto/update-overview-dashboard.dto';
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

  // ----------------get total view with grotth--------------------------------------

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

    // ---------pageGroth percentage-----------------
    let pageGroth: number;

    if (lastMonthCount === 0) {
      pageGroth = currentMonthCount;
    } else {
      pageGroth = Math.round(
        ((currentMonthCount - lastMonthCount) / lastMonthCount) * 100,
      );
    }

    // Current total
    const total = await this.prisma.totalPageview.findFirst();
    const baseCount = total?.count ?? 1;

    return {
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

  @HandleError('super admin can total get view user role')
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
      userCount: 0,
      adminCount: 0,
      superAdminCount: 0,
      memberCount: 0,
    };

    userRoles.forEach((r) => {
      switch (r.role) {
        case 'USER':
          roleCounts.userCount = r._count.role;
          break;
        case 'ADMIN':
          roleCounts.adminCount = r._count.role;
          break;
        case 'SUPER_ADMIN':
          roleCounts.superAdminCount = r._count.role;
          break;
        case 'MEMBER':
          roleCounts.memberCount = r._count.role;
          break;
      }
    });

    return {
      totalUser,
      totalPageViewCount,
      ...roleCounts,
    };
  }
  //----------------- traffic & engagement overview  ----------------------------
  @HandleError('Failed to get traffic & engagement overview')
  async getOverview() {
    // ----------------- Total page views -----------------
    const pageView = await this.prisma.totalPageview.findFirst();
    const totalPageViews = pageView?.count ?? 0;

    // ----------------- User counts grouped by role -----------------
    const roleCountsRaw = await this.prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
    });

    const roleCounts: Record<string, number> = {};
    roleCountsRaw.forEach((r) => {
      roleCounts[r.role] = r._count.role;
    });

    // ----------------- Total user activities -----------------
    const totalActivities = await this.prisma.userActivity.count();

    // ----------------- Monthly breakdowns -----------------
    const usersByMonth = await this.prisma.user.groupBy({
      by: ['createdAt'],
      _count: { id: true },
      orderBy: { createdAt: 'asc' },
    });

    const activitiesByMonth = await this.prisma.userActivity.groupBy({
      by: ['createdAt'],
      _count: { id: true },
      orderBy: { createdAt: 'asc' },
    });

    const pageViewsByMonth = await this.prisma.totalPageview.groupBy({
      by: ['createdAt'],
      _count: { id: true },
      orderBy: { createdAt: 'asc' },
    });

    // Format monthly data (YYYY-MM)
    function formatMonthly(
      data: { createdAt: Date; _count: { id: number } }[],
    ) {
      return data.reduce<Record<string, number>>((acc, item) => {
        const month = item.createdAt.toISOString().slice(0, 7); // "YYYY-MM"
        acc[month] = (acc[month] ?? 0) + item._count.id;
        return acc;
      }, {});
    }

    return {
      totalPageViews,
      totalActivities,
      roles: roleCounts,
      monthly: {
        users: formatMonthly(usersByMonth),
        activities: formatMonthly(activitiesByMonth),
        pageViews: formatMonthly(pageViewsByMonth),
      },
    };
  }

  remove(id: number) {
    return `This action removes a #${id} overviewDashboard`;
  }
}
