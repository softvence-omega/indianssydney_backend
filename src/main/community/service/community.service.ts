import { Injectable } from '@nestjs/common';
import {
  CreateCommentDto,
  CreateCommentReactionDto,
  CreateCommunityDto,
  CreatePostReactionDto,
} from '../dto/create-community.dto';
import { UpdateCommunityDto } from '../dto/update-community.dto';
import { successResponse, TResponse } from 'src/common/utils/response.util';
import { FileService } from 'src/lib/file/file.service';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination';
import { HandleError } from 'src/common/error/handle-error.decorator';

@Injectable()
export class CommunityService {
  constructor(
    private readonly fileService: FileService,
    private readonly prisma: PrismaService,
  ) {}

  // ----------- Create Community Post ------------
  @HandleError('Failed to create community post', 'communityPost')
  async create(
    payload: CreateCommunityDto,
    userId: string,
    files: any,
  ): Promise<TResponse<any>> {
    let thumbnailUrl: string | undefined;
    let videoUrl: string | undefined;

    // Process uploaded image
    if (payload.file) {
      const processedFile = await this.fileService.processUploadedFile(
        payload.file,
      );
      thumbnailUrl = processedFile.url;
    }

    // Process uploaded video
    if (payload.video) {
      const processedVideo = await this.fileService.processUploadedFile(
        payload.video,
      );
      videoUrl = processedVideo.url;
    }

    const data: any = {
      description: payload.description,
      userId,
    };

    if (thumbnailUrl) {
      data.image = thumbnailUrl;
    }

    if (videoUrl) {
      data.video = videoUrl;
    }

    //  Include user info in response
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

  // --------------------------- Add Comment -----------------------------
  @HandleError('Failed to add comment', 'Comment')
  async createComment(payload: CreateCommentDto & { userId: string }) {
    const comment = await this.prisma.comment.create({
      data: {
        content: payload.content,
        userId: payload.userId,
        communityPostId: payload.communityPostId,
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

  // ----------- Add Post Reaction ------------
  @HandleError('Failed to add post reaction', 'PostReaction')
  async createPostReaction(
    payload: CreatePostReactionDto & { userId: string },
  ) {
    const postreaction = await this.prisma.postReaction.create({
      data: {
        type: payload.type,
        userId: payload.userId,
        communityPostId: payload.communityPostId,
      },
    });
    return successResponse(postreaction, 'Post reaction added successfully');
  }

  // ----------- Add Comment Reaction ------------
  @HandleError('Failed to add comment reaction', 'CommentReaction')
  async createCommentReaction(
    payload: CreateCommentReactionDto & { userId: string },
  ) {
    const commentreaction = await this.prisma.commentReaction.create({
      data: {
        type: payload.type,
        userId: payload.userId,
        commentId: payload.commentId,
      },
    });
    return successResponse(
      commentreaction,
      'Comment reaction added successfully',
    );
  }

  // -----------  for Community ------------
  @HandleError('Failed to fetch community posts', 'communityPost')
  async findAll(query: PaginationDto): Promise<TResponse<any>> {
    const page = query.page || 1;
    const limit = query.limit && query.limit >= 0 ? query.limit : 10;
    const posts = await this.prisma.communityPost.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        // CommentReaction
        comments: {
          include: {
            user: true,
            reactions: true,
          },
        },
        // PostReaction
        reactions: true,
      },
    });

    // Map to rename nested arrays
    const formattedPosts = posts.map((post) => ({
      id: post.id,
      description: post.description,
      image: post.image,
      video: post.video,
      userId: post.userId,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      postReactions: post.reactions, // rename PostReaction
      comments: post.comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        user: comment.user,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        commentReactions: comment.reactions, // rename CommentReaction
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
    const post = await this.prisma.communityPost.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, profilePhoto: true },
        },
        comments: {
          include: {
            user: { select: { id: true, fullName: true, profilePhoto: true } },
            reactions: {
              include: {
                user: {
                  select: { id: true, fullName: true, profilePhoto: true },
                },
              },
            },
          },
        },
        reactions: {
          // Post reactions
          include: {
            user: { select: { id: true, fullName: true, profilePhoto: true } },
          },
        },
      },
    });

    if (!post) return null;

    // Map to rename nested arrays
    const formattedPost = {
      id: post.id,
      description: post.description,
      image: post.image,
      video: post.video,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      user: post.user,
      postReactions: post.reactions,
      comments: post.comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        user: comment.user,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        commentReactions: comment.reactions,
      })),
    };

    return successResponse(
      formattedPost,
      'Community post fetched successfully',
    );
  }

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
