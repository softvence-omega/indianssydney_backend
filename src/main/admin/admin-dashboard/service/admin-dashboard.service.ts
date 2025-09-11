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
  const totalContributorRole = await this.prisma.user.count({
    where: { isDeleted: false, role: 'CONTIBUTOR' },
  });

  const contentPublished = await this.prisma.content.count({
    where: { status: 'APPROVE', isDeleted: false },
  });

  const contentPending = await this.prisma.content.count({
    where: { status: 'PENDING', isDeleted: false },
  });

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


  findAll() {
    return `This action returns all adminDashboard`;
  }

  findOne(id: number) {
    return `This action returns a #${id} adminDashboard`;
  }

  update(id: number, updateAdminDashboardDto: UpdateAdminDashboardDto) {
    return `This action updates a #${id} adminDashboard`;
  }

  remove(id: number) {
    return `This action removes a #${id} adminDashboard`;
  }
}
