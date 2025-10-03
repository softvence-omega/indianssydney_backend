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
import { AdditionalContentType } from '@prisma/client';
import {
  CreateContentComemnt,
  CreateContentCommentReactionDto,
  CreateContentReactionDto,
} from '../dto/create-content-comment.dto';
import { UpdateContentDto } from '../dto/update-content.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ContentService {
  constructor(
    private readonly fileService: FileService,
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}
  // ---------------------content crate-----------------------
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

      if (payload.image) {
        const processedFile = await this.fileService.processUploadedFile(
          payload.image,
        );
        imageUrl = processedFile?.url;
      }
      if (payload.video) {
        const processedVideo = await this.fileService.processUploadedFile(
          payload.video,
        );
        videoUrl = processedVideo?.url;
      }
      if (payload.videoThumbnail) {
        const processedThumb = await this.fileService.processUploadedFile(
          payload.videoThumbnail,
        );
        videoThumbUrl = processedThumb?.url;
      }
      if (payload.audio) {
        const processedAudio = await this.fileService.processUploadedFile(
          payload.audio,
        );
        audioUrl = processedAudio?.url;
      }
//-------  external  API expects "content"---------
let evaluationResult: any;

if (payload.paragraph) {
  try {
    const response = await firstValueFrom(
      this.httpService.post(
        'https://theaustraliancanvas.onrender.com/files/content-evaluation',
        { content: payload.paragraph }, 
      ),
    );

    evaluationResult = response.data;
  } catch (error) {
    console.error('External API error:', error.message);
    evaluationResult = { success: false, error_message: 'External API failed' };
  }
}



      




      // ---------- Transaction: create Content + AdditionalContent--------
      const content = await this.prisma.$transaction(async (tx) => {
        const newContent = await tx.content.create({

          
          data: {
            title: payload.title,
            subTitle: payload.subTitle,
            subcategorysslug: payload.subcategorysslug,
            categorysslug: payload.categorysslug,
            paragraph: payload.paragraph,
            shortQuote: payload.shortQuote,
            youtubeVideoUrl: payload.youtubeVideoUrl,
            image: imageUrl,
            video: videoUrl,
            videoThumbnail: videoThumbUrl,
            audio: audioUrl,
            imageCaption: payload.imageCaption,
            tags: payload.tags ?? [],
            contentType: payload.contentType,
            userId: userId,
            categoryId: payload.categoryId,
            subCategoryId: payload.subCategoryId,
            evaluationResult: evaluationResult
        ? JSON.stringify(evaluationResult)
        : null,
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
                type: field.type as AdditionalContentType,
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

  // ----------------- get all content------------------
  @HandleError('Failed to fetch all contents', 'content')
  async findAllContent(): Promise<TResponse<any>> {
    const contents = await this.prisma.content.findMany({
      where: { isDeleted: false, status: 'APPROVE' },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, profilePhoto: true },
        },
        category: true,
        subCategory: true,
        ContentComments: {
          include: { reactions: true },
        },
        ContentReactions: true,
        additionalContents: { orderBy: { order: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // enrich each content with counts
    const enrichedContents = contents.map((content) => {
      const likeCount = content.ContentReactions.filter(
        (r) => r.type === 'LIKE',
      ).length;

      const dislikeCount = content.ContentReactions.filter(
        (r) => r.type === 'DISLIKE',
      ).length;

      const commentCount = content.ContentComments?.length || 0;

      const commentReactionCount =
        content.ContentComments?.reduce(
          (total, comment) => total + (comment.reactions?.length || 0),
          0,
        ) || 0;

      const commentLikeCount =
        content.ContentComments?.reduce(
          (total, comment) =>
            total +
            (comment.reactions?.filter((r) => r.type === 'LIKE').length || 0),
          0,
        ) || 0;

      const commentDislikeCount =
        content.ContentComments?.reduce(
          (total, comment) =>
            total +
            (comment.reactions?.filter((r) => r.type === 'DISLIKE').length ||
              0),
          0,
        ) || 0;

      const totalCommentLength =
        content.ContentComments?.reduce(
          (total, comment) => total + (comment.contentcomment?.length || 0),
          0,
        ) || 0;

      const avgCommentLength =
        commentCount > 0 ? totalCommentLength / commentCount : 0;

      return {
        ...content,
        likeCount,
        dislikeCount,
        reactionCount: content.ContentReactions?.length || 0,
        commentCount,
        commentReactionCount,
        commentLikeCount,
        commentDislikeCount,
        totalCommentLength,
        avgCommentLength,
      };
    });

    return successResponse(
      enrichedContents,
      'All contents fetched successfully',
    );
  }

  // ---------------------single  contents by id -----------------
  @HandleError('Failed to fetch user contents', 'content')
  async findOne(id: string): Promise<TResponse<any>> {
    const content = await this.prisma.content.findUnique({
      where: { id, isDeleted: false, status: 'APPROVE' },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, profilePhoto: true },
        },
        category: true,
        subCategory: true,
        ContentComments: {
          include: {
            reactions: true,
          },
        },
        ContentReactions: true,
        additionalContents: { orderBy: { order: 'asc' } },
      },
    });

    if (!content) throw new BadRequestException('Content not found');

    // ---------- Content Reactions ----------
    const likeCount = content.ContentReactions.filter(
      (r) => r.type === 'LIKE',
    ).length;

    const dislikeCount = content.ContentReactions.filter(
      (r) => r.type === 'DISLIKE',
    ).length;

    // ---------- Comments ----------
    const commentCount = content.ContentComments?.length || 0;

    // all reactions on all comments
    const commentReactionCount =
      content.ContentComments?.reduce(
        (total, comment) => total + (comment.reactions?.length || 0),
        0,
      ) || 0;

    const commentLikeCount =
      content.ContentComments?.reduce(
        (total, comment) =>
          total +
          (comment.reactions?.filter((r) => r.type === 'LIKE').length || 0),
        0,
      ) || 0;

    const commentDislikeCount =
      content.ContentComments?.reduce(
        (total, comment) =>
          total +
          (comment.reactions?.filter((r) => r.type === 'DISLIKE').length || 0),
        0,
      ) || 0;

    // ---------- Comment Length ----------

    const totalCommentLength =
      content.ContentComments?.reduce(
        (total, comment) => total + (comment.contentcomment?.length || 0),
        0,
      ) || 0;

    // average comment length
    const avgCommentLength =
      commentCount > 0 ? totalCommentLength / commentCount : 0;

    return successResponse(
      {
        ...content,
        // content stats
        likeCount,
        dislikeCount,
        reactionCount: content.ContentReactions?.length || 0,

        // comment stats
        commentCount,
        commentReactionCount,
        commentLikeCount,
        commentDislikeCount,
        totalCommentLength,
        avgCommentLength,
      },
      'Content fetched successfully',
    );
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

    // ------------- increment contentviews by ----------------------
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

  //-------  delete soft --------

  @HandleError('Failed to deleted content')
  async deleteContent(id: string) {
    await this.prisma.content.update({
      where: { id, status: 'Declined' },
      data: { isDeleted: true },
    });

    return { message: 'Content deleted successfully' };
  }

  // --------------- update content---------

  @HandleError('Failed to update content', 'content')
  async update(
    id: string,
    payload: UpdateContentDto,
    userId: string,
    files: Express.Multer.File[],
  ): Promise<TResponse<any>> {
    try {
      // ---------------- Validate Content ----------------
      const existingContent = await this.prisma.content.findUnique({
        where: { id },
        include: { additionalContents: true },
      });
      if (!existingContent) {
        throw new BadRequestException(`Content with ID ${id} does not exist`);
      }

      // ---------------- Validate User ----------------
      const userExists = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!userExists) {
        throw new BadRequestException(`Invalid userId: ${userId}`);
      }

      // ---------------- Validate Category/SubCategory ----------------
      if (payload.categoryId) {
        const categoryExists = await this.prisma.category.findUnique({
          where: { id: payload.categoryId },
        });
        if (!categoryExists) {
          throw new BadRequestException(
            `Invalid categoryId: ${payload.categoryId}`,
          );
        }
      }
      if (payload.subCategoryId) {
        const subCategoryExists = await this.prisma.subCategory.findUnique({
          where: { id: payload.subCategoryId },
        });
        if (!subCategoryExists) {
          throw new BadRequestException(
            `Invalid subCategoryId: ${payload.subCategoryId}`,
          );
        }
      }

      // ---------------- Process Files ----------------
      let imageUrl = existingContent.image;
      let videoUrl = existingContent.video;
      let videoThumbUrl = existingContent.videoThumbnail;
      let audioUrl = existingContent.audio;

      if (payload.image) {
        const processedFile = await this.fileService.processUploadedFile(
          payload.image,
        );
        imageUrl = processedFile?.url;
      }
      if (payload.video) {
        const processedVideo = await this.fileService.processUploadedFile(
          payload.video,
        );
        videoUrl = processedVideo?.url;
      }
      if (payload.videoThumbnail) {
        const processedThumb = await this.fileService.processUploadedFile(
          payload.videoThumbnail,
        );
        videoThumbUrl = processedThumb?.url;
      }
      if (payload.audio) {
        const processedAudio = await this.fileService.processUploadedFile(
          payload.audio,
        );
        audioUrl = processedAudio?.url;
      }

      // ---------------- Transaction ----------------
      const updatedContent = await this.prisma.$transaction(async (tx) => {
        // ---- Update Content ----
        const content = await tx.content.update({
          where: { id },
          data: {
            title: payload.title ?? existingContent.title,
            subTitle: payload.subTitle ?? existingContent.subTitle,
            subcategorysslug:
              payload.subcategorysslug ?? existingContent.subcategorysslug,
            categorysslug:
              payload.categorysslug ?? existingContent.categorysslug,
            paragraph: payload.paragraph ?? existingContent.paragraph,
            shortQuote: payload.shortQuote ?? existingContent.shortQuote,
            youtubeVideoUrl:
              payload.youtubeVideoUrl ?? existingContent.youtubeVideoUrl,
            image: imageUrl,
            video: videoUrl,
            videoThumbnail: videoThumbUrl,
            audio: audioUrl,
            imageCaption: payload.imageCaption ?? existingContent.imageCaption,
            tags: payload.tags ?? existingContent.tags,
            contentType: payload.contentType ?? existingContent.contentType,
            categoryId: payload.categoryId ?? existingContent.categoryId,
            subCategoryId:
              payload.subCategoryId ?? existingContent.subCategoryId,
            updatedAt: new Date(),
          },
        });

        // ---- Replace Additional Fields ----
        if (payload.additionalFields) {
          await tx.additionalContent.deleteMany({ where: { contentId: id } });

          let order = 1;
          for (const field of payload.additionalFields) {
            if (!field.type || (!field.value && !field.file)) continue;

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
                contentId: id,
                value: fileUrl || '',
                order: order++,
              },
            });
          }
        }

        return content;
      });

      // ---------------- Fetch Updated Content ----------------
      const result = await this.prisma.content.findUnique({
        where: { id: updatedContent.id },
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

      return successResponse(result, 'Content updated successfully');
    } catch (error) {
      console.error('Update content error:', error);
      throw new BadRequestException(
        error.message || 'Failed to update content',
      );
    }
  }


  // -----get content by category slug---
@HandleError('Failed to fetch contents by category slug', 'content')
async getContentByCategorySlug(categorySlug: string) {
    const contents = await this.prisma.content.findMany({
      where: { categorysslug: categorySlug, isDeleted: false, status: 'APPROVE' },
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

    return successResponse(contents, 'Contents fetched successfully');
  }

  // -----get content by subcategory slug---
@HandleError('Failed to fetch contents by subcategory slug', 'content')
async getContentBySubCategorySlug(subCategorySlug: string) {
    const contents = await this.prisma.content.findMany({
      where: { subcategorysslug: subCategorySlug, isDeleted: false, status: 'APPROVE' },
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

    return successResponse(contents, 'Contents fetched successfully');
  }
}
