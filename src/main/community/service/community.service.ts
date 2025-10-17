import { Injectable } from '@nestjs/common';
import {
  CreateCommentDto,
  CreateCommentReactionDto,
  CreateCommunityDto,
  CreatePostReactionDto,
} from '../dto/create-community.dto';
import { UpdateCommunityDto } from '../dto/update-community.dto';
import {
  successResponse,
  TResponse,
} from 'src/common/utilsResponse/response.util';
import { FileService } from 'src/lib/file/file.service';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination';
import { HandleError } from 'src/common/error/handle-error.decorator';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import uploadFileToS3 from 'src/lib/utils/uploadImageAWS';
@Injectable()
export class CommunityService {
  constructor(
    private readonly fileService: FileService,
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  // ----------- Create Community Post ------------
  // @HandleError('Failed to create community post', 'communityPost')
  // async create(
  //   payload: CreateCommunityDto,
  //   userId: string,
  //   files: any,
  // ): Promise<TResponse<any>> {
  //   let thumbnailUrl: string | undefined;
  //   let videoUrl: string | undefined;

  //   // Process uploaded image
  //   if (payload.file) {
  //     const processedFile = await this.fileService.processUploadedFile(
  //       payload.file,
  //     );
  //     thumbnailUrl = processedFile.url;
  //   }

  //   // Process uploaded video
  //   if (payload.video) {
  //     const processedVideo = await this.fileService.processUploadedFile(
  //       payload.video,
  //     );
  //     videoUrl = processedVideo.url;
  //   }

  //   const data: any = {
  //     description: payload.description,
  //     userId,
  //   };

  //   if (thumbnailUrl) {
  //     data.image = thumbnailUrl;
  //   }

  //   if (videoUrl) {
  //     data.video = videoUrl;
  //   }

  //   //  Include user info in response
  //   const communityPost = await this.prisma.communityPost.create({
  //     data,
  //     include: {
  //       user: {
  //         select: {
  //           id: true,
  //           fullName: true,
  //           email: true,
  //           profilePhoto: true,
  //         },
  //       },
  //     },
  //   });

  //   return successResponse(
  //     communityPost,
  //     'Community post created successfully',
  //   );
  // }

  @HandleError('Failed to create community post', 'communityPost')
  async create(
    payload: CreateCommunityDto,
    userId: string,
  ): Promise<TResponse<any>> {
    let thumbnailUrl: string | undefined;
    let videoUrl: string | undefined;

    // Use S3 URLs if files were uploaded
    if (payload.file) {
      thumbnailUrl = payload.file.url;
    }

    if (payload.video) {
      videoUrl = payload.video.url;
    }

    const data: any = {
      description: payload.description,
      userId,
    };

    if (thumbnailUrl) data.image = thumbnailUrl;
    if (videoUrl) data.video = videoUrl;

    // Include user info in response
    const communityPost = await this.prisma.communityPost.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true,
          },
        },
      },
    });

    return successResponse(
      communityPost,
      'Community post created successfully',
    );
  }

  // -------create comment ----
  @HandleError('Failed to add comment', 'Comment')
  async createComment(payload: CreateCommentDto & { userId: string }) {
    const apiUrl = 'https://ai.australiancanvas.com/files/hatespeech';

    let hateSpeechResult = {
      hate_speech_detect: false,
      confidence: 0,
      explanation: null,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(apiUrl, { text: payload.content }),
      );

      const data = response.data;
      hateSpeechResult = {
        hate_speech_detect: Boolean(data.hate_speech_detect),
        confidence: data.confidence,
        explanation: data.explanation,
      };
    } catch (error) {
      console.error('Hate speech API error:', error.message);
    }

    // Save comment with AI response
    const comment = await this.prisma.comment.create({
      data: {
        content: payload.content,
        userId: payload.userId,
        communityPostId: payload.communityPostId,
        hate_speech_detect: hateSpeechResult.hate_speech_detect,
        confidence: hateSpeechResult.confidence,
        explanation: hateSpeechResult.explanation,
      },
    });

    return successResponse(comment, 'Comment added successfully');
  }

  // --------------get comment-----------
  @HandleError('Failed to fetch community comments', 'Comment')
  async findAllComments() {
    const comments = await this.prisma.comment.findMany({
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
        CommunityPost: {
          select: {
            id: true,
            description: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse(
      comments,
      'All community comments fetched successfully',
    );
  }

  // // ----------- Add Post Reaction ------------
  // @HandleError('Failed to add post reaction', 'PostReaction')
  // async createPostReaction(
  //   payload: CreatePostReactionDto & { userId: string },
  // ) {
  //   const postreaction = await this.prisma.postReaction.create({
  //     data: {
  //       type: payload.type,
  //       userId: payload.userId,
  //       communityPostId: payload.communityPostId,
  //     },
  //   });
  //   return successResponse(postreaction, 'Post reaction added successfully');
  // }

  // // ----------- Add Comment Reaction ------------
  // @HandleError('Failed to add comment reaction', 'CommentReaction')
  // async createCommentReaction(
  //   payload: CreateCommentReactionDto & { userId: string },
  // ) {
  //   const commentreaction = await this.prisma.commentReaction.create({
  //     data: {
  //       type: payload.type,
  //       userId: payload.userId,
  //       commentId: payload.commentId,
  //     },
  //   });
  //   return successResponse(
  //     commentreaction,
  //     'Comment reaction added successfully',
  //   );
  // }

  // ----------- Add Post Reaction ------------
  @HandleError('Failed to add post reaction', 'PostReaction')
  async createPostReaction(
    payload: CreatePostReactionDto & { userId: string },
  ) {
    const { type, userId, communityPostId } = payload;

    return this.prisma.$transaction(async (tx) => {
      // Check if the post exists
      const post = await tx.communityPost.findUnique({
        where: { id: communityPostId },
      });
      if (!post) {
        throw new Error('Community post not found');
      }

      // Find existing reaction by the user for this post
      const existingReaction = await tx.postReaction.findFirst({
        where: {
          userId,
          communityPostId,
        },
      });

      // Initialize count updates
      let likeCountDelta = 0;
      let dislikeCountDelta = 0;

      if (existingReaction) {
        if (existingReaction.type === type) {
          // Same reaction type: remove it (toggle off)
          await tx.postReaction.delete({
            where: { id: existingReaction.id },
          });
          if (type === 'LIKE') {
            likeCountDelta = -1;
          } else {
            dislikeCountDelta = -1;
          }
        } else {
          // Different reaction type: remove existing and add new
          await tx.postReaction.delete({
            where: { id: existingReaction.id },
          });
          await tx.postReaction.create({
            data: {
              type,
              userId,
              communityPostId,
            },
          });
          if (type === 'LIKE') {
            likeCountDelta = 1;
            dislikeCountDelta = existingReaction.type === 'DISLIKE' ? -1 : 0;
          } else {
            dislikeCountDelta = 1;
            likeCountDelta = existingReaction.type === 'LIKE' ? -1 : 0;
          }
        }
      } else {
        // No existing reaction: add new
        await tx.postReaction.create({
          data: {
            type,
            userId,
            communityPostId,
          },
        });
        if (type === 'LIKE') {
          likeCountDelta = 1;
        } else {
          dislikeCountDelta = 1;
        }
      }

      // Note: Reaction counts are calculated dynamically from reactions table

      // Fetch the updated reaction for response
      const postReaction = await tx.postReaction.findFirst({
        where: { userId, communityPostId, type },
      });

      return successResponse(
        postReaction,
        'Post reaction updated successfully',
      );
    });
  }

  // ----------- Add Comment Reaction ------------
  @HandleError('Failed to add comment reaction', 'CommentReaction')
  async createCommentReaction(
    payload: CreateCommentReactionDto & { userId: string },
  ) {
    const { type, userId, commentId } = payload;

    return this.prisma.$transaction(async (tx) => {
      // Check if the comment exists
      const comment = await tx.comment.findUnique({
        where: { id: commentId },
      });
      if (!comment) {
        throw new Error('Comment not found');
      }

      // Find existing reaction by the user for this comment
      const existingReaction = await tx.commentReaction.findFirst({
        where: {
          userId,
          commentId,
        },
      });

      // Initialize count updates
      let likeCountDelta = 0;
      let dislikeCountDelta = 0;

      if (existingReaction) {
        if (existingReaction.type === type) {
          // Same reaction type: remove it (toggle off)
          await tx.commentReaction.delete({
            where: { id: existingReaction.id },
          });
          if (type === 'LIKE') {
            likeCountDelta = -1;
          } else {
            dislikeCountDelta = -1;
          }
        } else {
          // Different reaction type: remove existing and add new
          await tx.commentReaction.delete({
            where: { id: existingReaction.id },
          });
          await tx.commentReaction.create({
            data: {
              type,
              userId,
              commentId,
            },
          });
          if (type === 'LIKE') {
            likeCountDelta = 1;
            dislikeCountDelta = existingReaction.type === 'DISLIKE' ? -1 : 0;
          } else {
            dislikeCountDelta = 1;
            likeCountDelta = existingReaction.type === 'LIKE' ? -1 : 0;
          }
        }
      } else {
        // No existing reaction: add new
        await tx.commentReaction.create({
          data: {
            type,
            userId,
            commentId,
          },
        });
        if (type === 'LIKE') {
          likeCountDelta = 1;
        } else {
          dislikeCountDelta = 1;
        }
      }

      // Note: Comment reaction counts are calculated dynamically from reactions table

      // Fetch the updated reaction for response
      const commentReaction = await tx.commentReaction.findFirst({
        where: { userId, commentId, type },
      });

      return successResponse(
        commentReaction,
        'Comment reaction updated successfully',
      );
    });
  }

  @HandleError('Failed to fetch community posts', 'communityPost')
  async findAll(query: PaginationDto): Promise<TResponse<any>> {
    const page = query.page || 1;
    const limit = query.limit && query.limit >= 0 ? query.limit : 10;

    const posts = await this.prisma.communityPost.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: true, // include post author
        comments: {
          include: {
            user: true, // include comment author
            reactions: true, // comment reactions
          },
        },
        reactions: true, // post reactions
      },
    });

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      description: post.description,
      image: post.image,
      video: post.video,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      user: {
        id: post.user.id,
        name: post.user.fullName,
        email: post.user.email,
        avatar: post.user.profilePhoto,
      },
      postLikeCount: post.reactions.filter((r) => r.type === 'LIKE').length,
      postDislikeCount: post.reactions.filter((r) => r.type === 'DISLIKE')
        .length,
      commentCount: post.comments.length,
      comments: post.comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        user: {
          id: comment.user.id,
          name: comment.user.fullName,
          email: comment.user.email,
          avatar: comment.user.profilePhoto,
        },
        commentLikeCount: comment.reactions.filter((r) => r.type === 'LIKE')
          .length,
        commentDislikeCount: comment.reactions.filter(
          (r) => r.type === 'DISLIKE',
        ).length,
        hate_speech_detect: comment.hate_speech_detect,
        confidence: comment.confidence,
        explanation: comment.explanation,
      })),
    }));

    return successResponse(
      formattedPosts,
      'All community posts fetched successfully',
    );
  }

  // -------------post reaction find by id---------------------
  @HandleError('Failed to fetch community post', 'communityPost')
  async findOne(id: string) {
    const posts = await this.prisma.communityPost.findMany({
      orderBy: { createdAt: 'desc' },

      include: {
        comments: {
          include: {
            user: true,
            reactions: true,
          },
        },
        reactions: true,
      },
    });

    // Map to rename nested arrays
    const formattedPost = posts.map((post) => {
      // Post like/dislike counts
      const postLikeCount = post.reactions.filter(
        (r) => r.type === 'LIKE',
      ).length;
      const postDislikeCount = post.reactions.filter(
        (r) => r.type === 'DISLIKE',
      ).length;

      return {
        id: post.id,
        description: post.description,
        image: post.image,
        video: post.video,
        userId: post.userId,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        postReactions: post.reactions,
        postLikeCount,
        postDislikeCount,
        commentCount: post.comments.length,
        comments: post.comments.map((comment) => {
          const commentLikeCount = comment.reactions.filter(
            (r) => r.type === 'LIKE',
          ).length;
          const commentDislikeCount = comment.reactions.filter(
            (r) => r.type === 'DISLIKE',
          ).length;

          return {
            id: comment.id,
            content: comment.content,
            user: comment.user,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
            commentReactions: comment.reactions,
            commentLikeCount,
            commentDislikeCount,
          };
        }),
      };
    });

    return successResponse(
      formattedPost,
      'Community post fetched successfully',
    );
  }
  // --------------failed to update community-----------

  @HandleError('Failed to update community post', 'communityPost')
  async update(id: string, updateCommunityDto: UpdateCommunityDto) {
    const data: any = {};

    if (updateCommunityDto.description) {
      data.description = updateCommunityDto.description;
    }

    if (updateCommunityDto.file) {
      const processedFile = await this.fileService.processUploadedFile(
        updateCommunityDto.file,
      );
      data.image = processedFile.url;
    }

    if (updateCommunityDto.video) {
      const processedVideo = await this.fileService.processUploadedFile(
        updateCommunityDto.video,
      );
      data.video = processedVideo.url;
    }
    // --------------update community post----------------

    const updated = await this.prisma.communityPost.update({
      where: { id },
      data,
    });
    return successResponse(updated, 'Community post updated successfully');
  }
  // --------delete --------------
  async remove(id: string) {
    const deleted = await this.prisma.communityPost.delete({
      where: { id },
    });
    return successResponse(deleted, 'Community post deleted successfully');
  }
}
