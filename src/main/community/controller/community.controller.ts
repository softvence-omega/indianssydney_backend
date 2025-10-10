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
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { GetUser, ValidateAuth } from 'src/common/jwt/jwt.decorator';
import {
  FileFieldsInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { FileType, MulterService } from 'src/lib/multer/multer.service';
import uploadFileToS3 from 'src/lib/utils/uploadImageAWS';

@ApiTags('Community Related Content')
@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  // // ----------- Create Community Post (with image + video) ------------
  // @ApiBearerAuth()
  // @ValidateAuth()
  // @Post('/community-post')
  // @ApiConsumes('multipart/form-data')
  // @UseInterceptors(
  //   FileFieldsInterceptor(
  //     [
  //       { name: 'file', maxCount: 1 },
  //       { name: 'video', maxCount: 1 },
  //     ],
  //     new MulterService().createMulterOptions('./temp', 'temp', FileType.ANY),
  //   ),
  // )
  // // --------------create community post-------------------------------
  // create(
  //   @UploadedFiles()
  //   files: { file?: Express.Multer.File[]; video?: Express.Multer.File[] },
  //   @GetUser('userId') userId: string,
  //   @Body() createCommunityDto: CreateCommunityDto,
  // ) {
  //   if (files.file) {
  //     createCommunityDto.file = files.file[0];
  //   }
  //   if (files.video) {
  //     createCommunityDto.video = files.video[0];
  //   }

  //   return this.communityService.create(createCommunityDto, userId, files);
  // }

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
    new MulterService().createMulterOptions('./uploads', 'content', FileType.ANY),
  ),
)
async create(
  @UploadedFiles()
  files: { file?: Express.Multer.File[]; video?: Express.Multer.File[] },
  @GetUser('userId') userId: string,
  @Body() createCommunityDto: CreateCommunityDto,
) {
  // Upload image to S3
  if (files.file && files.file[0]) {
    const s3File = await uploadFileToS3(files.file[0].path);
    createCommunityDto.file = s3File;
    try { await import('fs/promises').then(fs => fs.unlink(files.file![0].path)); } 
    catch (err) { console.warn('⚠️ Failed to delete local image:', err); }
  }

  // Upload video to S3
  if (files.video && files.video[0]) {
    const s3Video = await uploadFileToS3(files.video[0].path);
    createCommunityDto.video = s3Video;
    try { await import('fs/promises').then(fs => fs.unlink(files.video![0].path)); } 
    catch (err) { console.warn('⚠️ Failed to delete local video:', err); }
  }

  return this.communityService.create(createCommunityDto, userId);
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
  @ApiOperation({ summary: 'Get all community posts' })
  @ApiBearerAuth()
  @ValidateAuth()
  @Get('community-post')
  findAll() {
    return this.communityService.findAll({});
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.communityService.findOne(id);
  }
  // ------------update community post----------------
  @ApiProperty()
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
