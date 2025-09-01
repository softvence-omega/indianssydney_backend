import { Injectable } from '@nestjs/common';
import { CreateOverviewDashboardDto } from '../dto/create-overview-dashboard.dto';
import { UpdateOverviewDashboardDto } from '../dto/update-overview-dashboard.dto';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { CreateTotalPageViewDto } from '../dto/create-page-view.dto';
import { ValidateAuth, ValidateSuperAdmin } from 'src/common/jwt/jwt.decorator';
import { HandleError } from 'src/common/error/handle-error.decorator';

@Injectable()
export class OverviewDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // Increment total view
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

  // Get total view with +15% of last month
  @HandleError('super admin can total get view user')
  async getTotalWithBonus() {
    const total = await this.prisma.totalPageview.findFirst();
    const baseCount = total?.count ?? 1;

    // Add 15% bonus
    const bonusCount = Math.ceil(baseCount * 0.15);
    const totalWithBonus = baseCount + bonusCount;

    return { baseCount, bonusCount, totalWithBonus };
  }

  // ----------------------total user----------------

  @HandleError('super admin can total get view user')
  async getTotalUser() {
    const totalUser = await this.prisma.user.count();
    return { totalUser };
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

  @HandleError('Failed to get traffic & engagement overview')
  async getOverview() {
    // Total page views
    const pageView = await this.prisma.totalPageview.findFirst();
    const totalPageViews = pageView?.count ?? 0;

    // User counts grouped by role dynamically
    const roleCountsRaw = await this.prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
    });

    const roleCounts: Record<string, number> = {};
    roleCountsRaw.forEach((r) => {
      roleCounts[r.role] = r._count.role;
    });

    // Total user activities
    const totalActivities = await this.prisma.userActivity.count();

    return {
      totalPageViews,
      totalActivities,
      roles: roleCounts, // dynamic roles count
    };
  }

  findAll() {
    return `This action returns all overviewDashboard`;
  }

  findOne(id: number) {
    return `This action returns a #${id} overviewDashboard`;
  }

  update(id: number, updateOverviewDashboardDto: UpdateOverviewDashboardDto) {
    return `This action updates a #${id} overviewDashboard`;
  }

  remove(id: number) {
    return `This action removes a #${id} overviewDashboard`;
  }
}
