// content/content.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateContentDto } from '../dto/create-content.dto';
import { FileService } from 'src/lib/file/file.service';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { successResponse, TResponse } from 'src/common/utils/response.util';
import { HandleError } from 'src/common/error/handle-error.decorator';
import {
  CreateContentComemnt,
  CreateContentCommentReactionDto,
  CreateContentReactionDto,
} from '../dto/create-content-comment.dto';
import { CreatePostReactionDto } from 'src/main/community/dto/create-community.dto';

@Injectable()
export class ContentService {
  constructor(
    private readonly fileService: FileService,
    private readonly prisma: PrismaService,
  ) {}

  @HandleError('Failed to create content', 'content')
  async create(
    payload: CreateContentDto,
    userId: string,
    files: Express.Multer.File[],
  ): Promise<TResponse<any>> {
    try {
      // ---------------Validate required fields-------------------------
      if (
        !payload.title ||
        !payload.contentType ||
        !payload.categoryId ||
        !payload.subCategoryId
      ) {
        throw new BadRequestException(
          `Missing required fields: ${[
            !payload.title && 'title',
            !payload.contentType && 'contentType',
            !payload.categoryId && 'categoryId',
            !payload.subCategoryId && 'subCategoryId',
          ]
            .filter(Boolean)
            .join(', ')}`,
        );
      }

      // ------------------Validate userId is provided-----------------------
      if (!userId) {
        throw new BadRequestException('Missing userId from authentication');
      }

      // -------------Validate userId exists---------------
      const userExists = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!userExists) {
        throw new BadRequestException(
          `Invalid userId: ${userId} does not exist`,
        );
      }

      // Validate categoryId and subCategoryId
      const categoryExists = await this.prisma.category.findUnique({
        where: { id: payload.categoryId },
      });
      if (!categoryExists) {
        throw new BadRequestException(
          `Invalid categoryId: ${payload.categoryId} does not exist`,
        );
      }

      const subCategoryExists = await this.prisma.subCategory.findUnique({
        where: { id: payload.subCategoryId },
      });
      if (!subCategoryExists) {
        throw new BadRequestException(
          `Invalid subCategoryId: ${payload.subCategoryId} does not exist`,
        );
      }

      // Process main file uploads
      let imageUrl: string | undefined;
      let videoUrl: string | undefined;
      let videoThumbUrl: string | undefined;
      let audioUrl: string | undefined;

      if (payload.mainImage) {
        const processedFile = await this.fileService.processUploadedFile(
          payload.mainImage,
        );
        imageUrl = processedFile?.url;
      }
      if (payload.videoFile) {
        const processedVideo = await this.fileService.processUploadedFile(
          payload.videoFile,
        );
        videoUrl = processedVideo?.url;
      }
      if (payload.videoThumbnail) {
        const processedThumb = await this.fileService.processUploadedFile(
          payload.videoThumbnail,
        );
        videoThumbUrl = processedThumb?.url;
      }
      if (payload.audioFile) {
        const processedAudio = await this.fileService.processUploadedFile(
          payload.audioFile,
        );
        audioUrl = processedAudio?.url;
      }

      // Transaction: create Content + AdditionalContent
      const content = await this.prisma.$transaction(async (tx) => {
        const newContent = await tx.content.create({
          data: {
            title: payload.title,
            subTitle: payload.subTitle,
            paragraph: payload.paragraph,
            shortQuote: payload.shortQuote,
            image: imageUrl,
            videoFile: videoUrl,
            videoThumbnail: videoThumbUrl,
            audioFile: audioUrl,
            imageCaption: payload.imageCaption,
            tags: payload.tags ?? [],
            contentType: payload.contentType,
            userId: userId,
            categoryId: payload.categoryId,
            subCategoryId: payload.subCategoryId,
          },
        });

        // Create AdditionalContent entries
        if (payload.additionalFields && payload.additionalFields.length > 0) {
          let order = 1;
          for (const field of payload.additionalFields) {
            if (
              !field.type ||
              (!field.value &&
                !field.file &&
                !['image', 'audio', 'video'].includes(field.type))
            ) {
              console.warn(
                `Skipping invalid additional field: ${JSON.stringify(field)}`,
              );
              continue;
            }
            let fileUrl: string | undefined;
            if (
              field.file &&
              ['image', 'audio', 'video'].includes(field.type)
            ) {
              const processedFile = await this.fileService.processUploadedFile(
                field.file,
              );
              fileUrl = processedFile?.url;
            } else {
              fileUrl = field.value;
            }
            await tx.additionalContent.create({
              data: {
                contentId: newContent.id,
                type: field.type,
                value: fileUrl || '',
                order: order++,
              },
            });
          }
        }

        return newContent;
      });

      // Fetch content with relations
      const result = await this.prisma.content.findUnique({
        where: { id: content.id },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profilePhoto: true,
            },
          },
          category: true,
          subCategory: true,
          additionalContents: { orderBy: { order: 'asc' } },
        },
      });

      return successResponse(result, 'Content created successfully');
    } catch (error) {
      console.error('Create content error:', error);
      throw new BadRequestException(
        error.message || 'Failed to create content',
      );
    }
  }

  @HandleError('Failed to fetch all contents', 'content')
  async findAll(): Promise<TResponse<any>> {
    const contents = await this.prisma.content.findMany({
      where: { isDeleted: false },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, profilePhoto: true },
        },
        category: true,
        subCategory: true,
        additionalContents: { orderBy: { order: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(contents, 'All contents fetched successfully');
  }
  // --------------------- user contents-----------------
  @HandleError('Failed to fetch user contents', 'content')
  async findOne(id: string): Promise<TResponse<any>> {
    const content = await this.prisma.content.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, profilePhoto: true },
        },
        category: true,
        subCategory: true,
        additionalContents: { orderBy: { order: 'asc' } },
      },
    });

    if (!content) throw new BadRequestException('Content not found');

    return successResponse(content, 'Content fetched successfully');
  }

  // ----------- Get contents by userId ------------
  @HandleError('Failed to fetch user contents', 'content')
  async getContentByUser(userId: string): Promise<TResponse<any>> {
    const contents = await this.prisma.content.findMany({
      where: { userId, isDeleted: false },
      include: {
        category: true,
        subCategory: true,
        additionalContents: { orderBy: { order: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(contents, 'User contents fetched successfully');
  }

  // ------------------- increment content view count -------------------
  @HandleError('Failed to increment content view count', 'content')
  async incrementView(id: string) {
    // check content exists
    const existing = await this.prisma.content.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Content not found');
    }

    // increment contentviews by
    return this.prisma.content.update({
      where: { id },
      data: {
        contentviews: { increment: 1 },
      },
    });
  }

  // -------------------------------create content comment---------------

  @HandleError('Failed to add comment', 'Comment')
  async createContentComment(
    payload: CreateContentComemnt & { userId: string },
  ) {
    const comment = await this.prisma.contentComment.create({
      data: {
        contentcomment: payload.contentcomment,
        userId: payload.userId,
        contentId: payload.contentId,
      },
    });

    return successResponse(comment, 'Comment added successfully');
  }

  // --------------get comment-----------
  async findAllContentComments() {
    const comments = await this.prisma.contentComment.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                profilePhoto: true,
              },
            },
          },
        },
        content: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(
      comments.map((c) => ({
        ...c,
        contentObj: c.content ?? null,
      })),
      'All content comments fetched successfully',
    );
  }

  // ----------- Add Post Reaction ------------
  @HandleError('Failed to add content reaction', 'PostReaction')
  async createContentReaction(
    payload: CreateContentReactionDto & { userId: string },
  ) {
    const postreaction = await this.prisma.contentReaction.create({
      data: {
        type: payload.type,
        userId: payload.userId,
        contentId: payload.contentId,
      },
    });
    return successResponse(
      postreaction,
      ' content Post reaction added successfully',
    );
  }

  // ----------- Add Comment Reaction ------------
  @HandleError('Failed to add contenet comment reaction', 'CommentReaction')
  async createContentCommentReaction(
    payload: CreateContentCommentReactionDto & { userId: string },
  ) {
    const commentreaction = await this.prisma.contentCommentReaction.create({
      data: {
        type: payload.type,
        userId: payload.userId,
        commentId: payload.contentId,
      },
    });
    return successResponse(
      commentreaction,
      'Content Comment reaction added successfully',
    );
  }
}
