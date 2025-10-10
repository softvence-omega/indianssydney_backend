import { ApiProperty } from '@nestjs/swagger';
import { ContetReactionType, ReactionType } from '@prisma/client';
import { IsEnum, IsString, IsUUID } from 'class-validator';
// ----------comment ----------------------
export class CreateContentComemnt {
  @ApiProperty({
    description: 'Comment content',
    example: 'This is a great news post!',
  })
  @IsString()
  contentcomment: string;

  @ApiProperty({
    description: 'contentId  where the comment belongs',
    example: 'c78252a1-68f1-433a-90db-7bfd79812cb2',
  })
  @IsUUID()
  contentId: string;
}
// ----------------- crate commnet reaction -------------------
export class CreateContentCommentReactionDto {
  @ApiProperty({
    description: 'Reaction type (LIKE or DISLIKE)',
    enum: ContetReactionType,
    example: ContetReactionType.LIKE,
  })
  @IsEnum(ContetReactionType)
  type: ContetReactionType;

  @ApiProperty({
    description: ' content Comment ID being reacted to',
    example: '133b9ccd-8e03-46ae-8519-b8f13649f610',
  })
  @IsUUID()
  contentId: string;
}

// ------------------ content commnet reaction------
export class CreateContentReactionDto {
  @ApiProperty({
    description: 'Reaction type (LIKE or DISLIKE)',
    enum: ReactionType,
    example: ReactionType.LIKE,
  })
  @IsEnum(ReactionType)
  type: ReactionType;

  @ApiProperty({
    description: 'content ID being reacted to',
    example: 'c78252a1-68f1-433a-90db-7bfd79812cb2',
  })
  @IsUUID()
  contentId: string;
}
