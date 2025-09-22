import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { HandleError } from 'src/common/error/handle-error.decorator';
import { ApplyStatus, Status } from '@prisma/client';

@Injectable()
export class AdminManagementService {
  constructor(private readonly prisma: PrismaService) {}
  @HandleError('Failed to update content status', 'contentmanage')
  async updateContentStatus(
    contentId: string,
    newStatus: Status,
    userId: string,
  ): Promise<any> {
    const content = await this.prisma.content.findUnique({
      where: { id: contentId },
      include: {
        user: {
          //  show content owner
          select: { id: true, fullName: true, email: true, profilePhoto: true },
        },
        category: { select: { id: true, name: true, slug: true } },
        subCategory: { select: { id: true, subname: true, subslug: true } },
      },
    });

    if (!content) {
      throw new BadRequestException('Content not found');
    }

    // update content
    const updated = await this.prisma.content.update({
      where: { id: contentId },
      data: { status: newStatus },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, profilePhoto: true },
        },
        category: { select: { id: true, name: true, slug: true } },
        subCategory: { select: { id: true, subname: true, subslug: true } },
      },
    });

    //  store history
    const history = await this.prisma.contentStatusHistory.create({
      data: {
        contentId,
        userId: userId,
        oldStatus: content.status,
        newStatus,
      },
    });

    //  get admin info
    const admin = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true, email: true, profilePhoto: true },
    });

    //  get counts
    const counts = await this.prisma.content.groupBy({
      by: ['status'],
      _count: { _all: true },
    });

    return {
      success: true,
      message: `Content status updated to ${newStatus}`,
      data: updated,
      changedBy: admin,
      counts: counts.reduce(
        (acc, cur) => ({
          ...acc,
          [cur.status.toLowerCase()]: cur._count._all,
        }),
        {},
      ),
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
  // ------------------------- side management----------------------------
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
  // ------------------------- content manage----------------------

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
  // ------------------------get all contibutor--------------------------------------------
  @HandleError('Failed to get all contributor', 'contentmanage')
  async getAllContributor() {
    return this.prisma.applytoContibute.findMany({
      where: {
        status: { not: ApplyStatus.REJECTED },
      },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, profilePhoto: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ----------manage contibute user -----------

  @HandleError('Contributor manage failed')
  async updateContributorApplicationStatus(
    applicationId: string,
    status: ApplyStatus,
  ) {
    const application = await this.prisma.applytoContibute.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new BadRequestException('Application not found');
    }

    // If approved, update user role to CONTIBUTOR and isContibute = true
    if (status === ApplyStatus.APPROVED) {
      await this.prisma.user.update({
        where: { id: application.userId },
        data: {
          role: 'CONTIBUTOR',
          isContibute: true,
        },
      });
    }

    // Update application status (approved or rejected)
    return this.prisma.applytoContibute.update({
      where: { id: applicationId },
      data: { status },
    });
  }

  // ----------get analytics get category-------------
  @HandleError('Failed to get analytics top category')
  async getAnalyticsTopCategory() {
    // total content count
    const totalContents = await this.prisma.content.count({
      where: { isDeleted: false },
    });

    if (totalContents === 0) {
      return [];
    }

    // group by categoryId from contents
    const grouped = await this.prisma.content.groupBy({
      by: ['categoryId'],
      _count: { categoryId: true },
      orderBy: { _count: { categoryId: 'desc' } },
      take: 10,
      where: { isDeleted: false },
    });

    // fetch category names
    const categories = await this.prisma.category.findMany({
      where: { id: { in: grouped.map((g) => g.categoryId) }, isDeleted: false },
      select: { id: true, name: true },
    });

    // merge and add percentage
    return grouped.map((g) => {
      const category = categories.find((c) => c.id === g.categoryId);
      return {
        categoryId: g.categoryId,
        categoryName: category?.name || 'Unknown',
        contentCount: g._count.categoryId,
        percentage:
          ((g._count.categoryId / totalContents) * 100).toFixed(2) + '%',
      };
    });
  }

  // ----------language total use ------------------
  @HandleError('Failed to get analytics top language')
  async getAnalyticsTopLanguage() {
    const totalUsage = await this.prisma.language.aggregate({
      _sum: { languageuse: true },
    });
    const total = totalUsage._sum.languageuse ?? 0;

    if (total === 0) {
      return [];
    }

    // fetch languages with usage
    const result = await this.prisma.language.findMany({
      select: {
        language: true,
        languageuse: true,
      },
      orderBy: { languageuse: 'desc' },
    });

    // add percentage
    return result.map((item) => ({
      language: item.language,
      count: item.languageuse ?? 0,
      percentage: (((item.languageuse ?? 0) / total) * 100).toFixed(2) + '%',
    }));
  }

  // --------------GET ANALYISS--------------------------

  @HandleError('Failed to get analytics top content')
  async getAnalyticsTopContent() {
    return this.prisma.content.findMany({
      where: { isDeleted: false },
      orderBy: { contentviews: 'desc' },
      take: 10,
      include: {
        user: {
          select: { id: true, fullName: true, profilePhoto: true },
        },
      },
    });
  }
}
