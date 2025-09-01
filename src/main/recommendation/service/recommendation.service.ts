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
  async userSelect(userId: string, payload: UseSelectRecommendationDto) {
    const { recommendationId } = payload;

    // Fetch user with existing recommendations
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { recommendations: true },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Check if recommendation is already assigned
    const alreadySelected = user.recommendations?.some(
      (r) => r.id === recommendationId,
    );

    if (alreadySelected) {
      return {
        message: 'Recommendation already selected for this user',
        userId,
        recommendationId,
      };
    }

    //-------------- Assign the recommendation to the user--------------
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        recommendations: {
          connect: { id: recommendationId },
        },
      },
      include: {
        recommendations: true,
      },
    });

    return {
      message: 'Recommendation assigned successfully',
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
}
