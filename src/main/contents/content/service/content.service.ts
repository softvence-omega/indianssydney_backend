// content/content.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateContentDto } from '../dto/create-content.dto';
import { FileService } from 'src/lib/file/file.service';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import {
  successResponse,
  TResponse,
} from 'src/common/utilsResponse/response.util';
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
import { S3FileService } from 'src/lib/s3file/s3file.service';

@Injectable()
export class ContentService {
  constructor(
    private readonly fileService: S3FileService,
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}
  // ---------------------content crate-----------------------
  // @HandleError('Failed to create content', 'content')
  // async create(
  //   payload: CreateContentDto,
  //   userId: string,
  //   files: Express.Multer.File[],
  // ): Promise<TResponse<any>> {
  //   try {
  //     // ---------------Validate required fields-------------------------
  //     if (
  //       !payload.title ||
  //       !payload.contentType ||
  //       !payload.categoryId ||
  //       !payload.subCategoryId
  //     ) {
  //       throw new BadRequestException(
  //         `Missing required fields: ${[
  //           !payload.title && 'title',
  //           !payload.contentType && 'contentType',
  //           !payload.categoryId && 'categoryId',
  //           !payload.subCategoryId && 'subCategoryId',
  //         ]
  //           .filter(Boolean)
  //           .join(', ')}`,
  //       );
  //     }

  //     // ------------------Validate userId is provided-----------------------
  //     if (!userId) {
  //       throw new BadRequestException('Missing userId from authentication');
  //     }

  //     // -------------Validate userId exists---------------
  //     const userExists = await this.prisma.user.findUnique({
  //       where: { id: userId },
  //     });
  //     if (!userExists) {
  //       throw new BadRequestException(
  //         `Invalid userId: ${userId} does not exist`,
  //       );
  //     }

  //     // Validate categoryId and subCategoryId
  //     const categoryExists = await this.prisma.category.findUnique({
  //       where: { id: payload.categoryId },
  //     });
  //     if (!categoryExists) {
  //       throw new BadRequestException(
  //         `Invalid categoryId: ${payload.categoryId} does not exist`,
  //       );
  //     }

  //     const subCategoryExists = await this.prisma.subCategory.findUnique({
  //       where: { id: payload.subCategoryId },
  //     });
  //     if (!subCategoryExists) {
  //       throw new BadRequestException(
  //         `Invalid subCategoryId: ${payload.subCategoryId} does not exist`,
  //       );
  //     }

  //     // ------------------ Process main file uploads -----------------------
  //     let imageUrl: string | undefined;
  //     let videoUrl: string | undefined;
  //     let videoThumbUrl: string | undefined;
  //     let audioUrl: string | undefined;

  //     // Find files directly from files[] (not payload)
  //     const imageFile = files?.find((f) => f.fieldname === 'image');
  //     const videoFile = files?.find((f) => f.fieldname === 'video');
  //     const videoThumbFile = files?.find(
  //       (f) => f.fieldname === 'videoThumbnail',
  //     );
  //     const audioFile = files?.find((f) => f.fieldname === 'audio');

  //     if (imageFile) {
  //       const processed = await this.fileService.processUploadedFile(imageFile);
  //       imageUrl = processed?.url;
  //     }
  //     if (videoFile) {
  //       const processed = await this.fileService.processUploadedFile(videoFile);
  //       videoUrl = processed?.url;
  //     }
  //     if (videoThumbFile) {
  //       const processed =
  //         await this.fileService.processUploadedFile(videoThumbFile);
  //       videoThumbUrl = processed?.url;
  //     }
  //     if (audioFile) {
  //       const processed = await this.fileService.processUploadedFile(audioFile);
  //       audioUrl = processed?.url;
  //     }
  //     //-------  external  API expects "content"---------
  //     // let evaluationResult: any;
  //     let compareResult: any;

  //     // ------ compare api call -----------
  //     if (payload.paragraph) {
  //       try {
  //         // TODO FIXED: proper query param usage
  //         const response = await firstValueFrom(
  //           this.httpService.post(
  //             `https://ai.australiancanvas.com/files/compare-text?text=${encodeURIComponent(
  //               payload.paragraph,
  //             )}`,
  //             {},
  //           ),
  //         );

  //         compareResult = response.data;
  //       } catch (error) {
  //         console.error('External API (compare-text) error:', error.message);
  //         compareResult = {
  //           success: false,
  //           error_message: 'External API (compare-text) failed',
  //         };
  //       }
  //     }
  //     // ---------- Transaction: create Content + AdditionalContent--------
  //     const content = await this.prisma.$transaction(async (tx) => {
  //       const newContent = await tx.content.create({
  //         data: {
  //           title: payload.title,
  //           subTitle: payload.subTitle,
  //           subcategorysslug: payload.subcategorysslug,
  //           categorysslug: payload.categorysslug,
  //           paragraph: payload.paragraph,
  //           shortQuote: payload.shortQuote,
  //           youtubeVideoUrl: payload.youtubeVideoUrl,
  //           image: imageUrl,
  //           video: videoUrl,
  //           videoThumbnail: videoThumbUrl,
  //           audio: audioUrl,
  //           imageCaption: payload.imageCaption,
  //           tags: payload.tags ?? [],
  //           contentType: payload.contentType,
  //           userId: userId,
  //           categoryId: payload.categoryId,
  //           subCategoryId: payload.subCategoryId,
  //           // evaluationResult: evaluationResult
  //           //   ? JSON.stringify(evaluationResult)
  //           //   : null,
  //           compareResult: compareResult ? JSON.stringify(compareResult) : null,
  //         },
  //       });

  //       // Create AdditionalContent entries
  //       if (payload.additionalFields && payload.additionalFields.length > 0) {
  //         let order = 1;
  //         for (const field of payload.additionalFields) {
  //           if (
  //             !field.type ||
  //             (!field.value &&
  //               !field.file &&
  //               !['image', 'audio', 'video'].includes(field.type))
  //           ) {
  //             console.warn(
  //               `Skipping invalid additional field: ${JSON.stringify(field)}`,
  //             );
  //             continue;
  //           }
  //           let fileUrl: string | undefined;
  //           if (
  //             field.file &&
  //             ['image', 'audio', 'video'].includes(field.type)
  //           ) {
  //             const processedFile = await this.fileService.processUploadedFile(
  //               field.file,
  //             );
  //             fileUrl = processedFile?.url;
  //           } else {
  //             fileUrl = field.value;
  //           }
  //           await tx.additionalContent.create({
  //             data: {
  //               contentId: newContent.id,
  //               type: field.type as AdditionalContentType,
  //               value: fileUrl || '',
  //               order: order++,
  //             },
  //           });
  //         }
  //       }

  //       return newContent;
  //     });

  //     // Fetch content with relations
  //     const result = await this.prisma.content.findUnique({
  //       where: { id: content.id },
  //       include: {
  //         user: {
  //           select: {
  //             id: true,
  //             fullName: true,
  //             email: true,
  //             profilePhoto: true,
  //           },
  //         },
  //         category: true,
  //         subCategory: true,
  //         additionalContents: { orderBy: { order: 'asc' } },
  //       },
  //     });

  //     // Parse evaluationResult and compareResult JSON fields
  //     if (result?.compareResult && typeof result.compareResult === 'string') {
  //       try {
  //         result.compareResult = JSON.parse(result.compareResult);
  //       } catch (err) {
  //         console.warn('Failed to parse compareResult JSON:', err.message);
  //       }
  //     }
  //     return successResponse(result, 'Content created successfully');
  //   } catch (error) {
  //     console.error('Create content error:', error);
  //     throw new BadRequestException(
  //       error.message || 'Failed to create content',
  //     );
  //   }
  // }

  // content.service.ts

  @HandleError('Failed to create content', 'content')
  async create(
    payload: CreateContentDto,
    userId: string,
    files: Express.Multer.File[],
  ): Promise<TResponse<any>> {
    try {
      // Validate required fields
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

      // Validate userId
      if (!userId) {
        throw new BadRequestException('Missing userId from authentication');
      }

      // Validate user existence
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

      // Define type for upload promises
      type UploadResult =
        | { imageUrl?: string }
        | { videoUrl?: string }
        | { videoThumbUrl?: string }
        | { audioUrl?: string };
      const uploadPromises: Promise<UploadResult>[] = [];

      // Process main file uploads in parallel
      const imageFile = files.find((f) => f.fieldname === 'image');
      const videoFile = files.find((f) => f.fieldname === 'video');
      const videoThumbFile = files.find(
        (f) => f.fieldname === 'videoThumbnail',
      );
      const audioFile = files.find((f) => f.fieldname === 'audio');

      if (imageFile)
        uploadPromises.push(
          this.fileService
            .processUploadedFile(imageFile)
            .then((res) => ({ imageUrl: res?.url })),
        );
      if (videoFile)
        uploadPromises.push(
          this.fileService
            .processUploadedFile(videoFile)
            .then((res) => ({ videoUrl: res?.url })),
        );
      if (videoThumbFile)
        uploadPromises.push(
          this.fileService
            .processUploadedFile(videoThumbFile)
            .then((res) => ({ videoThumbUrl: res?.url })),
        );
      if (audioFile)
        uploadPromises.push(
          this.fileService
            .processUploadedFile(audioFile)
            .then((res) => ({ audioUrl: res?.url })),
        );

      const uploadResults = await Promise.all(uploadPromises);
      const { imageUrl, videoUrl, videoThumbUrl, audioUrl } = Object.assign(
        {},
        ...uploadResults,
      ) as {
        imageUrl?: string;
        videoUrl?: string;
        videoThumbUrl?: string;
        audioUrl?: string;
      };

      // External API call for compare-text
      let compareResult: any;
      if (payload.paragraph) {
        try {
          const response = await firstValueFrom(
            this.httpService.post(
              `https://ai.australiancanvas.com/files/compare-text?text=${encodeURIComponent(
                payload.paragraph,
              )}`,
              {},
            ),
          );
          compareResult = response.data;
        } catch (error) {
          console.error('External API (compare-text) error:', error.message);
          compareResult = {
            success: false,
            error_message: 'External API (compare-text) failed',
          };
        }
      }

      // Transaction: create Content + AdditionalContent
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
            compareResult: compareResult ? JSON.stringify(compareResult) : null,
          },
        });

        // Process additional fields in parallel
        if (payload.additionalFields && payload.additionalFields.length > 0) {
          const additionalContentPromises = payload.additionalFields
            .filter(
              (field) =>
                field.type &&
                (field.value ||
                  field.file ||
                  ['image', 'audio', 'video'].includes(field.type)),
            )
            .map(async (field, index) => {
              let fileUrl: string | undefined;
              if (
                field.file &&
                ['image', 'audio', 'video'].includes(field.type)
              ) {
                const processedFile =
                  await this.fileService.processUploadedFile(field.file);
                fileUrl = processedFile?.url;
              } else {
                fileUrl = field.value;
              }
              return {
                contentId: newContent.id,
                type: field.type as AdditionalContentType,
                value: fileUrl || '',
                order: index + 1,
              };
            });

          const additionalContents = await Promise.all(
            additionalContentPromises,
          );
          await tx.additionalContent.createMany({ data: additionalContents });
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

      // Parse compareResult JSON field
      if (result?.compareResult && typeof result.compareResult === 'string') {
        try {
          result.compareResult = JSON.parse(result.compareResult);
        } catch (err) {
          console.warn('Failed to parse compareResult JSON:', err.message);
        }
      }

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

    // ---------- Comment  average comment length ----------
    const avgCommentLength =
      commentCount > 0 ? totalCommentLength / commentCount : 0;

    return successResponse(
      {
        ...content,
        likeCount,
        dislikeCount,
        reactionCount: content.ContentReactions?.length || 0,

        // - ---------  comment stats. -------------
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

  // -------------------------------create content comment. ---------------

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

  // @HandleError('Failed to update content', 'content')
  // async update(
  //   id: string,
  //   payload: UpdateContentDto,
  //   userId: string,
  //   files: Express.Multer.File[],
  // ): Promise<TResponse<any>> {
  //   try {
  //     // ---------------- Validate Content ----------------
  //     const existingContent = await this.prisma.content.findUnique({
  //       where: { id },
  //       include: { additionalContents: true },
  //     });
  //     if (!existingContent) {
  //       throw new BadRequestException(`Content with ID ${id} does not exist`);
  //     }

  //     // ---------------- Validate User ----------------
  //     const userExists = await this.prisma.user.findUnique({
  //       where: { id: userId },
  //     });
  //     if (!userExists) {
  //       throw new BadRequestException(`Invalid userId: ${userId}`);
  //     }

  //     // ---------------- Validate Category/SubCategory ----------------
  //     if (payload.categoryId) {
  //       const categoryExists = await this.prisma.category.findUnique({
  //         where: { id: payload.categoryId },
  //       });
  //       if (!categoryExists) {
  //         throw new BadRequestException(
  //           `Invalid categoryId: ${payload.categoryId}`,
  //         );
  //       }
  //     }
  //     if (payload.subCategoryId) {
  //       const subCategoryExists = await this.prisma.subCategory.findUnique({
  //         where: { id: payload.subCategoryId },
  //       });
  //       if (!subCategoryExists) {
  //         throw new BadRequestException(
  //           `Invalid subCategoryId: ${payload.subCategoryId}`,
  //         );
  //       }
  //     }

  //     // ---------------- Process Files ----------------
  //     let imageUrl = existingContent.image;
  //     let videoUrl = existingContent.video;
  //     let videoThumbUrl = existingContent.videoThumbnail;
  //     let audioUrl = existingContent.audio;

  //     if (payload.image) {
  //       const processedFile = await this.fileService.processUploadedFile(
  //         payload.image,
  //       );
  //       imageUrl = processedFile?.url;
  //     }
  //     if (payload.video) {
  //       const processedVideo = await this.fileService.processUploadedFile(
  //         payload.video,
  //       );
  //       videoUrl = processedVideo?.url;
  //     }
  //     if (payload.videoThumbnail) {
  //       const processedThumb = await this.fileService.processUploadedFile(
  //         payload.videoThumbnail,
  //       );
  //       videoThumbUrl = processedThumb?.url;
  //     }
  //     if (payload.audio) {
  //       const processedAudio = await this.fileService.processUploadedFile(
  //         payload.audio,
  //       );
  //       audioUrl = processedAudio?.url;
  //     }

  //     // ---------------- Transaction ----------------
  //     const updatedContent = await this.prisma.$transaction(async (tx) => {
  //       // ---- Update Content ----
  //       const content = await tx.content.update({
  //         where: { id },
  //         data: {
  //           title: payload.title ?? existingContent.title,
  //           subTitle: payload.subTitle ?? existingContent.subTitle,
  //           subcategorysslug:
  //             payload.subcategorysslug ?? existingContent.subcategorysslug,
  //           categorysslug:
  //             payload.categorysslug ?? existingContent.categorysslug,
  //           paragraph: payload.paragraph ?? existingContent.paragraph,
  //           shortQuote: payload.shortQuote ?? existingContent.shortQuote,
  //           youtubeVideoUrl:
  //             payload.youtubeVideoUrl ?? existingContent.youtubeVideoUrl,
  //           image: imageUrl,
  //           video: videoUrl,
  //           videoThumbnail: videoThumbUrl,
  //           audio: audioUrl,
  //           imageCaption: payload.imageCaption ?? existingContent.imageCaption,
  //           tags: payload.tags ?? existingContent.tags,
  //           contentType: payload.contentType ?? existingContent.contentType,
  //           categoryId: payload.categoryId ?? existingContent.categoryId,
  //           subCategoryId:
  //             payload.subCategoryId ?? existingContent.subCategoryId,
  //           updatedAt: new Date(),
  //         },
  //       });

  //       // ---- Replace Additional Fields ----
  //       if (payload.additionalFields) {
  //         await tx.additionalContent.deleteMany({ where: { contentId: id } });

  //         let order = 1;
  //         for (const field of payload.additionalFields) {
  //           if (!field.type || (!field.value && !field.file)) continue;

  //           let fileUrl: string | undefined;
  //           if (
  //             field.file &&
  //             ['image', 'audio', 'video'].includes(field.type)
  //           ) {
  //             const processedFile = await this.fileService.processUploadedFile(
  //               field.file,
  //             );
  //             fileUrl = processedFile?.url;
  //           } else {
  //             fileUrl = field.value;
  //           }

  //           await tx.additionalContent.create({
  //             data: {
  //               contentId: id,
  //               value: fileUrl || '',
  //               order: order++,
  //             },
  //           });
  //         }
  //       }

  //       return content;
  //     });

  //     // ---------------- Fetch Updated Content ----------------
  //     const result = await this.prisma.content.findUnique({
  //       where: { id: updatedContent.id },
  //       include: {
  //         user: {
  //           select: {
  //             id: true,
  //             fullName: true,
  //             email: true,
  //             profilePhoto: true,
  //           },
  //         },
  //         category: true,
  //         subCategory: true,
  //         additionalContents: { orderBy: { order: 'asc' } },
  //       },
  //     });

  //     return successResponse(result, 'Content updated successfully');
  //   } catch (error) {
  //     console.error('Update content error:', error);
  //     throw new BadRequestException(
  //       error.message || 'Failed to update content',
  //     );
  //   }
  // }

  @HandleError('Failed to update content', 'content')
  async update(
    id: string,
    payload: UpdateContentDto,
    userId: string,
    files: Express.Multer.File[],
  ): Promise<TResponse<any>> {
    try {
      // Validate Content
      const existingContent = await this.prisma.content.findUnique({
        where: { id },
        include: { additionalContents: true },
      });
      if (!existingContent) {
        throw new BadRequestException(`Content with ID ${id} does not exist`);
      }

      // Validate User
      const userExists = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!userExists) {
        throw new BadRequestException(`Invalid userId: ${userId}`);
      }

      // Validate Category/SubCategory
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

      // Process Files in Parallel
      type UploadResult =
        | { imageUrl?: string }
        | { videoUrl?: string }
        | { videoThumbUrl?: string }
        | { audioUrl?: string };
      const uploadPromises: Promise<UploadResult>[] = [];

      if (payload.image) {
        uploadPromises.push(
          this.fileService
            .processUploadedFile(payload.image)
            .then((res) => ({ imageUrl: res?.url })),
        );
      }
      if (payload.video) {
        uploadPromises.push(
          this.fileService
            .processUploadedFile(payload.video)
            .then((res) => ({ videoUrl: res?.url })),
        );
      }
      if (payload.videoThumbnail) {
        uploadPromises.push(
          this.fileService
            .processUploadedFile(payload.videoThumbnail)
            .then((res) => ({ videoThumbUrl: res?.url })),
        );
      }
      if (payload.audio) {
        uploadPromises.push(
          this.fileService
            .processUploadedFile(payload.audio)
            .then((res) => ({ audioUrl: res?.url })),
        );
      }

      const uploadResults = await Promise.all(uploadPromises);
      const {
        imageUrl = existingContent.image,
        videoUrl = existingContent.video,
        videoThumbUrl = existingContent.videoThumbnail,
        audioUrl = existingContent.audio,
      } = Object.assign({}, ...uploadResults) as {
        imageUrl?: string;
        videoUrl?: string;
        videoThumbUrl?: string;
        audioUrl?: string;
      };

      // External API call for compare-text
      let compareResult: any;
      if (payload.paragraph) {
        try {
          const response = await firstValueFrom(
            this.httpService.post(
              `https://ai.australiancanvas.com/files/compare-text?text=${encodeURIComponent(
                payload.paragraph,
              )}`,
              {},
            ),
          );
          compareResult = response.data;
        } catch (error) {
          console.error('External API (compare-text) error:', error.message);
          compareResult = {
            success: false,
            error_message: 'External API (compare-text) failed',
          };
        }
      }

      // Transaction: Update Content + AdditionalContent
      const updatedContent = await this.prisma.$transaction(async (tx) => {
        // Update Content
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
            compareResult: compareResult
              ? JSON.stringify(compareResult)
              : existingContent.compareResult,
            updatedAt: new Date(),
          },
        });

        // Replace Additional Fields
        if (payload.additionalFields && payload.additionalFields.length > 0) {
          await tx.additionalContent.deleteMany({ where: { contentId: id } });

          const additionalContentPromises = payload.additionalFields
            .filter(
              (field) =>
                field.type &&
                (field.value ||
                  field.file ||
                  ['image', 'audio', 'video'].includes(field.type)),
            )
            .map(async (field, index) => {
              let fileUrl: string | undefined;
              if (
                field.file &&
                ['image', 'audio', 'video'].includes(field.type)
              ) {
                const processedFile =
                  await this.fileService.processUploadedFile(field.file);
                fileUrl = processedFile?.url;
              } else {
                fileUrl = field.value;
              }
              return {
                contentId: id,
                type: field.type as AdditionalContentType,
                value: fileUrl || '',
                order: index + 1,
              };
            });

          const additionalContents = await Promise.all(
            additionalContentPromises,
          );
          await tx.additionalContent.createMany({ data: additionalContents });
        }

        return content;
      });

      // Fetch Updated Content with Relations
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

      // Parse compareResult JSON field
      if (result?.compareResult && typeof result.compareResult === 'string') {
        try {
          result.compareResult = JSON.parse(result.compareResult);
        } catch (err) {
          console.warn('Failed to parse compareResult JSON:', err.message);
        }
      }

      return successResponse(result, 'Content updated successfully');
    } catch (error) {
      console.error('Update content error:', error);
      throw new BadRequestException(
        error.message || 'Failed to update content',
      );
    }
  }

  // ------------------- Get content by category slug -------------------
  async getContentByContentCategorySlug(categorySlug: string) {
    const contents = await this.prisma.content.findMany({
      where: {
        categorysslug: { equals: categorySlug, mode: 'insensitive' },
        isDeleted: false,
        status: 'APPROVE',
        contentType: 'ARTICLE',
      },
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
        additionalContents: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(
      contents,
      'Contents fetched successfully by category',
    );
  }

  // ------------------- Get content by subcategory slug -------------------
  async getContentByContentSubCategorySlug(subcategorySlug: string) {
    const contents = await this.prisma.content.findMany({
      where: {
        subcategorysslug: { equals: subcategorySlug, mode: 'insensitive' },
        isDeleted: false,
        status: 'APPROVE',
        contentType: 'ARTICLE',
      },
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
        additionalContents: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(
      contents,
      'Contents fetched successfully by subcategory',
    );
  }

  // ------------- Get homepage content by category with limit 7 each -------------

  @HandleError('Failed to fetch homepage contents', 'content')
  async getHomePageContent(): Promise<TResponse<any>> {
    try {
      const categories = await this.prisma.category.findMany({
        where: { isDeleted: false },
        select: { id: true, name: true, slug: true },
      });

      if (!categories || categories.length === 0) {
        return successResponse([], 'No categories found');
      }

      const contentsByCategory = await Promise.all(
        categories.map(async (category) => {
          const contents = await this.prisma.content.findMany({
            where: {
              categoryId: category.id,
              isDeleted: false,
              status: 'APPROVE',
              contentType: 'ARTICLE',
            },
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
              ContentComments: {
                // Include for stats calculation
                include: { reactions: true },
              },
              ContentReactions: true,
              additionalContents: { orderBy: { order: 'asc' } },
            },
            orderBy: { createdAt: 'desc' },
            take: 7,
          });

          //------  Enrich each content with stats (like in findAllContent)--------
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
                  (comment.reactions?.filter((r) => r.type === 'LIKE').length ||
                    0),
                0,
              ) || 0;
            const commentDislikeCount =
              content.ContentComments?.reduce(
                (total, comment) =>
                  total +
                  (comment.reactions?.filter((r) => r.type === 'DISLIKE')
                    .length || 0),
                0,
              ) || 0;
            const totalCommentLength =
              content.ContentComments?.reduce(
                (total, comment) =>
                  total + (comment.contentcomment?.length || 0),
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

          return {
            category: {
              id: category.id,
              name: category.name,
              slug: category.slug,
            },
            contents: enrichedContents,
            totalContentsInCategory: enrichedContents.length,
          };
        }),
      );

      return successResponse(
        contentsByCategory,
        `Homepage contents fetched successfully (${contentsByCategory.reduce((sum, group) => sum + group.contents.length, 0)} total items)`,
      );
    } catch (error) {
      console.error('getHomePageContent error:', error);
      throw error;
    }
  }

  // ------get content by getContentByTypeBy PODCAST-----

  @HandleError('Failed to fetch contents by content type', 'podcast')
  async getContentByTypeByPODCAST(): Promise<TResponse<any>> {
    const contents = await this.prisma.content.findMany({
      where: {
        contentType: 'PODCAST',
        isDeleted: false,
        status: 'APPROVE',
      },
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

    return successResponse(contents, 'Podcast contents fetched successfully');
  }

  // ------------------ get content by getContent ByTypeBy VIDEO-----------------

  @HandleError('Failed to fetch contents by content type', 'video')
  async getContentByTypeByVIDEO(): Promise<TResponse<any>> {
    const contents = await this.prisma.content.findMany({
      where: {
        contentType: 'VIDEO',
        isDeleted: false,
        status: 'APPROVE',
      },
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

    return successResponse(contents, 'Video contents fetched successfully');
  }

  //  -----------------Get content by query ----------------
  @HandleError('Failed to fetch contents by query', 'query')
  async getContentBySearch(query: string): Promise<TResponse<any>> {
    const contents = await this.prisma.content.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                title: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
              {
                subTitle: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
              {
                category: {
                  name: {
                    contains: query,
                    mode: 'insensitive',
                  },
                },
              },
              {
                subCategory: {
                  subname: {
                    contains: query,
                    mode: 'insensitive',
                  },
                },
              },
            ],
          },
          { isDeleted: false },
          { status: 'APPROVE' },
        ],
      },
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
        additionalContents: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(contents, 'Contents fetched successfully');
  }
  // ------------------ Get content by getContent ByType By ARTICLE-----------------

  @HandleError('Failed to fetch contents by content type', 'article')
  async getContentByTypeByARTICLE(): Promise<TResponse<any>> {
    const contents = await this.prisma.content.findMany({
      where: {
        contentType: 'ARTICLE',
        isDeleted: false,
        status: 'APPROVE',
      },
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

    return successResponse(contents, 'Article contents fetched successfully');
  }

  // ------------------ Bookmark Content ------------------
  @HandleError('Failed to bookmark content', 'bookmark')
  async bookmarkContent(contentId: string, userId: string) {
    try {
      // Check if already bookmarked
      const existing = await this.prisma.bookmark.findUnique({
        where: { userId_contentId: { userId, contentId } },
      });

      if (existing) {
        return { message: 'Content already bookmarked' };
      }

      // -------Create bookmark-------

      const bookmark = await this.prisma.bookmark.create({
        data: { userId, contentId },
        include: { content: true },
      });

      return { message: 'Content bookmarked successfully', bookmark };
    } catch (error) {
      throw new Error('Failed to bookmark content: ' + error.message);
    }
  }

  // ------------------ Get all bookmarks for a user ------------------
  @HandleError('Failed to fetch bookmarks', 'bookmark')
  async getBookmarkedContents(userId: string) {
    try {
      const bookmarks = await this.prisma.bookmark.findMany({
        where: { userId, isDeleted: false },
        include: { content: true },
        orderBy: { createdAt: 'desc' },
      });

      return bookmarks.map((b) => b.content);
    } catch (error) {
      throw new Error('Failed to fetch bookmarks: ' + error.message);
    }
  }

  // ------------------ Remove bookmark ------------------
  @HandleError('Failed to remove bookmark', 'bookmark')
  async removeBookmark(contentId: string, userId: string) {
    try {
      // Soft delete: just set isDeleted = true
      const updated = await this.prisma.bookmark.update({
        where: { userId_contentId: { userId, contentId } },
        data: { isDeleted: true },
      });

      return { message: 'Bookmark removed successfully', bookmark: updated };
    } catch (error) {
      throw new Error('Failed to remove bookmark: ' + error.message);
    }
  }

  // Optional: Check if content is bookmarked
  async isBookmarked(contentId: string, userId: string) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: { userId_contentId: { userId, contentId } },
    });
    return !!bookmark;
  }
}
