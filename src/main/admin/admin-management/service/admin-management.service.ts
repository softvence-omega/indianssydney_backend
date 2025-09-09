import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { HandleError } from 'src/common/error/handle-error.decorator';
import { ApplyStatus, Status } from '@prisma/client';

@Injectable()
export class AdminManagementService {
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
