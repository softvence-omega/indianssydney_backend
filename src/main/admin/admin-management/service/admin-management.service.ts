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
}
