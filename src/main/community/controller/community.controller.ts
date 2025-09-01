import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { CommunityService } from '../service/community.service';
import {
  CreateCommunityDto,
  CreateCommentDto,
  CreatePostReactionDto,
  CreateCommentReactionDto,
} from '../dto/create-community.dto';
import { UpdateCommunityDto } from '../dto/update-community.dto';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { GetUser, ValidateAuth } from 'src/common/jwt/jwt.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { FileType, MulterService } from 'src/lib/multer/multer.service';

@ApiTags('Community Related Content')
@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  // ----------- Create Community Post (with image + video) ------------
  @ApiBearerAuth()
  @ValidateAuth()
  @Post('/community-post')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'file', maxCount: 1 },
        { name: 'video', maxCount: 1 },
      ],
      new MulterService().createMulterOptions('./temp', 'temp', FileType.ANY),
    ),
  )
  // --------------create community post-------------------------------
  create(
    @UploadedFiles()
    files: { file?: Express.Multer.File[]; video?: Express.Multer.File[] },
    @GetUser('userId') userId: string,
    @Body() createCommunityDto: CreateCommunityDto,
  ) {
   
    if (files.file) {
      createCommunityDto.file = files.file[0];
    }
    if (files.video) {
      createCommunityDto.video = files.video[0];
    }

    return this.communityService.create(createCommunityDto, userId, files);
  }

  // ----------- Add Comment ------------
  @ApiBearerAuth()
  @ValidateAuth()
  @Post('/community-comment')
  createComment(
    @GetUser('userId') userId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.communityService.createComment({ ...createCommentDto, userId });
  }
  // -------get comment all comment----------------
  @ApiBearerAuth()
  @ValidateAuth()
  @Get('community-comment')
  findAllComments() {
    return this.communityService.findAllComments();
  }

  // ----------- Add Post Reaction ------------
  @ApiBearerAuth()
  @ValidateAuth()
  @Post('/post-reaction')
  createPostReaction(
    @GetUser('userId') userId: string,
    @Body() dto: CreatePostReactionDto,
  ) {
    return this.communityService.createPostReaction({ ...dto, userId });
  }

  // ----------- Add Comment Reaction ------------
  @ApiBearerAuth()
  @ValidateAuth()
  @Post('/comment-reaction')
  createCommentReaction(
    @GetUser('userId') userId: string,
    @Body() dto: CreateCommentReactionDto,
  ) {
    return this.communityService.createCommentReaction({ ...dto, userId });
  }
  // --------get community post------------
  @ApiBearerAuth()
  @ValidateAuth()
  @Get('community-post')
  findAll() {
    return this.communityService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.communityService.findOne(id);
  }
  // ------------update community post----------------
  @ApiBearerAuth()
  @ValidateAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'file', maxCount: 1 },
        { name: 'video', maxCount: 1 },
      ],
      new MulterService().createMulterOptions('./temp', 'temp', FileType.ANY),
    ),
  )
  // --------------update community post-------------------
  @Patch(':id')
  update(
    @Param('id') id: string,
    @UploadedFiles()
    files: { file?: Express.Multer.File[]; video?: Express.Multer.File[] },
    @Body() updateCommunityDto: UpdateCommunityDto,
  ) {
    // Assign uploaded files to DTO
    if (files.file) {
      updateCommunityDto.file = files.file[0];
    }
    if (files.video) {
      updateCommunityDto.video = files.video[0];
    }

    return this.communityService.update(id, updateCommunityDto);
  }
  // ------------- delete ------------------
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.communityService.remove(id);
  }
}
