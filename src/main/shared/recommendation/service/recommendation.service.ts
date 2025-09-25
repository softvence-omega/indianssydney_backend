import { Injectable } from '@nestjs/common';
import { CreateRecommendationDto } from '../dto/create-recommendation.dto';
import { UpdateRecommendationDto } from '../dto/update-recommendation.dto';
import { FileService } from 'src/lib/file/file.service';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { HandleError } from 'src/common/error/handle-error.decorator';

import { AppError } from 'src/common/error/handle-error.app';
import { successResponse, TResponse } from 'src/common/utils/response.util';
import { UseSelectRecommendationDto } from '../dto/select-recommendation';

@Injectable()
export class RecommendationService {
  constructor(
    private readonly fileService: FileService,
    private readonly prisma: PrismaService,
  ) {}
  // -------------------admin crated  recommandation---------------
  @HandleError('Failed to create recommendation', 'Recommendation only admin')
  async create(
    payload: CreateRecommendationDto,
    userId: string,
  ): Promise<TResponse<any>> {
    if (!payload.file) {
      throw new AppError(400, 'Recommendation image is required');
    }

    let fileInstance: any;
    if (payload.file) {
      fileInstance = await this.fileService.processUploadedFile(payload.file);
    }
    const recommendation = await this.prisma.recommendation.create({
      data: {
        name: payload.name,
        title: payload.title,
        description: payload.description,
        icon: fileInstance.url,
        userId: userId,
      },
    });

    return successResponse(recommendation, 'sucesssfully created now');
  }

  // ------------use selected recommandation ----------
  // recommendation.service.ts
  @HandleError('Failed to assign recommendations', 'Recommendation only user')
  async userSelect(userId: string, payload: UseSelectRecommendationDto) {
    const { recommendationIds } = payload;

    // Fetch user with existing recommendations
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { recommendations: true },
    });

    if (!user) throw new AppError(404, 'User not found');

    // Filter out already-selected ones
    const alreadySelectedIds = user.recommendations.map((r) => r.id);
    const newIds = recommendationIds.filter(
      (id) => !alreadySelectedIds.includes(id),
    );

    if (newIds.length === 0) {
      return {
        message: 'All provided recommendations are already selected',
        userId,
        selectedRecommendations: user.recommendations,
      };
    }

    // Assign multiple recommendations
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        recommendations: {
          connect: newIds.map((id) => ({ id })),
        },
      },
      include: {
        recommendations: true,
      },
    });

    return {
      message: 'Recommendations assigned successfully',
      userId: updatedUser.id,
      selectedRecommendations: updatedUser.recommendations,
    };
  }

  // ----------find all ------------------
  @HandleError(
    'Failed to find all recommendations',
    'Recommendation  see all users & slected it',
  )
  async findAll() {
    const recommendations = await this.prisma.recommendation.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            profilePhoto: true,
          },
        },
      },
    });
    return successResponse(
      recommendations,
      'sucesssfully get all recommendation',
    );
  }

  async findOne(id: string) {
    const recommendationfindwithid =
      await this.prisma.recommendation.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              profilePhoto: true,
            },
          },
        },
      });
    return successResponse(
      recommendationfindwithid,
      'sucesssfully get all recommendation',
    );
  }

  // recommendation.service.ts remove it

  @HandleError('Failed to remove recommendation', 'Recommendation only admin')
  async remove(id: string) {
    const removeRecommandation = await this.prisma.recommendation.delete({
      where: { id },
    });
    return successResponse(
      removeRecommandation,
      'sucesssfully get all recommendation',
    );
  }

  // ---------------update recommendation ------------------------
@HandleError('Failed to update recommendation', 'Recommendation only admin')
  async update(id: string, payload: CreateRecommendationDto) {
    let fileUrl: string | undefined;

    if (payload.file) {
      const fileInstance = await this.fileService.processUploadedFile(
        payload.file,
      );
      fileUrl = fileInstance.url;
    }

    const updated = await this.prisma.recommendation.update({
      where: { id },
      data: {
        name: payload.name,
        description: payload.description,
        ...(fileUrl ? { icon: fileUrl } : {}),
      },
    });

    return successResponse(updated, 'Recommendation updated successfully');
  }

  // recommendation.service.ts
  @HandleError('Failed to get user selected recommendations')
  async getUserSelected(userId: string): Promise<TResponse<any>> {
    // Fetch user with selected recommendations
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        recommendations: {
          include: {
            user: {
              select: { id: true, fullName: true, profilePhoto: true },
            },
          },
        },
      },
    });

    if (!user) throw new AppError(404, 'User not found');

    return successResponse(
      user.recommendations,
      'User selected recommendations retrieved successfully',
    );
  }

  // --------recommendation.service.ts---------
  @HandleError('Failed to get user selected recommendations with category contents')
  async getUserSelectedWithContent(userId: string): Promise<TResponse<any>> {
    // Fetch user with selected recommendations
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        recommendations: {
          include: {
            user: {
              select: { id: true, fullName: true, profilePhoto: true },
            },
          },
        },
      },
    });

    if (!user) throw new AppError(404, 'User not found');

    // Map each recommendation to include its category and contents
    const result = await Promise.all(
      user.recommendations.map(async (rec) => {
        // Find the category linked by the recommendation's title
        const category = await this.prisma.category.findFirst({
          where: { name: rec.title },
          include: {
            contents: true, // fetch all contents under this category
          },
        });

        return {
          recommendationId: rec.id,
          recommendationTitle: rec.title,
          categoryId: category?.id ?? null,
          categoryName: category?.name ?? null,
          contents:
            category?.contents.map((c) => ({
              id: c.id,
              title: c.title,
              subTitle: c.subTitle,
              paragraph: c.paragraph,
              shortQuote: c.shortQuote,
              image: c.image,
              video: c.video,
              audio: c.audio,
              videoThumbnail: c.videoThumbnail,
              youtubeVideoUrl: c.youtubeVideoUrl,
              tags: c.tags,
              evaluationResult: c.evaluationResult,
            })) ?? [],
        };
      }),
    );

    return successResponse(
      result,
      'User selected recommendations with category contents retrieved successfully',
    );
  }
}
