import { ApiProperty } from '@nestjs/swagger';
import { ReactionType } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

// ------------- Create Community Post ------------
export class CreateCommunityDto {
  @ApiProperty({
    description: 'The description/content of the community post',
    example: 'This is my first post!',
  })
  @IsString()
  description: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Community post image file',
  })
  @IsOptional()
  file?: { url: string; key: string };

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Community post video file',
  })
  @IsOptional()
  video?: { url: string; key: string };
}

// ----------- Create Post Reaction --------------
export class CreatePostReactionDto {
  @ApiProperty({
    description: 'Reaction type (LIKE or DISLIKE)',
    enum: ReactionType,
    example: ReactionType.LIKE,
  })
  @IsEnum(ReactionType, { message: 'Reaction type must be LIKE or DISLIKE' })
  type: ReactionType;

  @ApiProperty({
    description: 'Community Post ID being reacted to',
    example: '770e8400-e29b-41d4-a716-446655440111',
  })
  @IsUUID()
  communityPostId: string;
}

// --------------- Create Comment Reaction ----------------
export class CreateCommentReactionDto {
  @ApiProperty({
    description: 'Reaction type (LIKE or DISLIKE)',
    enum: ReactionType,
    example: ReactionType.LIKE,
  })
  @IsEnum(ReactionType)
  type: ReactionType;

  @ApiProperty({
    description: 'Comment ID being reacted to',
    example: '660e8400-e29b-41d4-a716-446655440111',
  })
  @IsUUID()
  commentId: string;
}

// ------ Create Comment DTO ------------
export class CreateCommentDto {
  @ApiProperty({
    description: 'Comment content',
    example: 'This is a great post!',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Community Post ID where the comment belongs',
    example: '770e8400-e29b-41d4-a716-446655440111',
  })
  @IsUUID()
  communityPostId: string;
}



