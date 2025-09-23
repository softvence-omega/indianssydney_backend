import {
  CreateContentComemnt,
  CreateContentReactionDto,
  CreateContentCommentReactionDto,
} from './../dto/create-content-comment.dto';
// content/content.controller.ts
import {
  Controller,
  Post,
  Body,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import { ContentService } from '../service/content.service';
import { CreateContentDto } from '../dto/create-content.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  GetUser,
  ValidateAuth,
  ValidateContibutor,
} from 'src/common/jwt/jwt.decorator';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { FileType, MulterService } from 'src/lib/multer/multer.service';
import { AdditionalFieldDto } from '../dto/additional-field.dto';

@ApiTags('Contents ALL Here News,Article')
@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @ApiOperation({
    summary: 'Create new content with files and additional data',
  })
  @ApiBearerAuth()
  @ValidateContibutor()
  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateContentDto })
  @UseInterceptors(
    AnyFilesInterceptor(
      new MulterService().createMulterOptions(
        './temp',
        'content',
        FileType.ANY,
      ),
    ),
  )
  async createContent(
    @Body() body: any,
    @GetUser('userId') userId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    console.log('Request Body:', body);
    console.log(
      'Uploaded Files:',
      files.map((f) => ({
        fieldname: f.fieldname,
        originalname: f.originalname,
        path: f.path,
      })),
    );
    console.log('User ID from Auth:', userId);

    const dto: CreateContentDto = {
      title: body.title,
      subTitle: body.subTitle,
      subcategorysslug : body.subcategorysslug,
      categorysslug : body.categorysslug,
      paragraph: body.paragraph,
      shortQuote: body.shortQuote,
      imageCaption: body.imageCaption,
      youtubeVideoUrl: body.youtubeVideoUrl,
      tags:
        typeof body.tags === 'string'
          ? body.tags.split(',').map((t: string) => t.trim())
          : body.tags || [],
      contentType: body.contentType,
      categoryId: body.categoryId,
      subCategoryId: body.subCategoryId,
      image: files.find((f) => f.fieldname === 'image'),
      videoThumbnail: files.find((f) => f.fieldname === 'videoThumbnail'),
      video: files.find((f) => f.fieldname === 'video'),
      audio: files.find((f) => f.fieldname === 'audio'),
      additionalFields: [],
    };

    // Parse additionalFields from JSON string or form-data
    if (body.additionalFields && typeof body.additionalFields === 'string') {
      try {
        dto.additionalFields = JSON.parse(body.additionalFields) || [];
        if (dto.additionalFields && dto.additionalFields.length > 0) {
          for (const field of dto.additionalFields) {
            // Validate that only image, audio, or video types have a file
            if (
              !['image', 'audio', 'video'].includes(field.type) &&
              field.file
            ) {
              console.warn(
                `Invalid file for field type ${field.type}, timestamp: ${field.timestamp}. Ignoring file.`,
              );
              field.file = undefined;
            }
            if (
              ['image', 'audio', 'video'].includes(field.type) &&
              field.file
            ) {
              const fileName =
                typeof field.file === 'string'
                  ? field.file
                  : field.file.originalname;
              const file = files.find(
                (f) =>
                  f.originalname === fileName ||
                  f.fieldname === `additional_${field.timestamp}[value]`,
              );
              if (file) {
                field.file = file;
              } else {
                console.warn(
                  `File not found for additional field: ${fileName}, timestamp: ${field.timestamp}`,
                );
                field.file = undefined;
              }
            }
          }
        }
      } catch (error) {
        throw new BadRequestException('Invalid additionalFields JSON format');
      }
    } else {
      const additionalGroups = new Map<string, Partial<AdditionalFieldDto>>();
      for (const key in body) {
        const match = key.match(/^additional_(\d+)\[(\w+)\]$/);
        if (match) {
          const timestamp = match[1];
          const subkey = match[2];

          if (!additionalGroups.has(timestamp)) {
            additionalGroups.set(timestamp, { timestamp });
          }

          const group = additionalGroups.get(timestamp)!;
          if (subkey === 'type') {
            group.type = body[key];
          } else if (subkey === 'value') {
            group.value = body[key];
          }
        }
      }

      for (const file of files) {
        const match = file.fieldname.match(/^additional_(\d+)\[value\]$/);
        if (match) {
          const timestamp = match[1];
          const group = additionalGroups.get(timestamp);
          if (group && ['image', 'audio', 'video'].includes(group.type!)) {
            group.file = file;
            group.value = file.filename;
          } else if (group) {
            console.warn(
              `Ignoring file for invalid field type ${group.type}, timestamp: ${timestamp}`,
            );
          }
        }
      }

      dto.additionalFields = Array.from(additionalGroups.values())
        .filter((group): group is AdditionalFieldDto => !!group.type)
        .sort((a, b) => Number(a.timestamp) - Number(b.timestamp));
    }

    console.log('DTO Additional Fields:', dto.additionalFields);

    if (
      !dto.title ||
      !dto.contentType ||
      !dto.categoryId ||
      !dto.subCategoryId
    ) {
      throw new BadRequestException(
        `Missing required fields: ${[
          !dto.title && 'title',
          !dto.contentType && 'contentType',
          !dto.categoryId && 'categoryId',
          !dto.subCategoryId && 'subCategoryId',
        ]
          .filter(Boolean)
          .join(', ')}`,
      );
    }

    return this.contentService.create(dto, userId, files);
  }

  //------------- Get all contents of authenticated user--------------
  @ApiOperation({ summary: 'Get all contents of the logged-in user' })
  @ApiBearerAuth()
  @ValidateContibutor()
  @Get('by-user')
  async getContentByUser(@GetUser('userId') userId: string) {
    console.log('user id content', userId);
    return this.contentService.getContentByUser(userId);
  }

  // ---------------Get all contents every where----------

  @ApiOperation({ summary: 'Get all contents all user' })
  @Get('contents-all')
  async findAllContent() {
    return this.contentService.findAllContent();
  }

  // ------------Get single content by id-----------------------
  @ApiOperation({ summary: 'Get a single content by ID' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.contentService.findOne(id);
  }
  // ------------------- increment content view count -------------------
  @ApiOperation({ summary: 'Increment content view count by 1' })
  @Patch(':id/views')
  async incrementViews(@Param('id') id: string) {
    return this.contentService.incrementView(id);
  }

  // ----------------  commnet content  -----------------------
  @Post('content-comment')
  @ApiBearerAuth()
  @ValidateAuth()
  createContentComment(
    @Body() payload: CreateContentComemnt,
    @GetUser('userId') userId: string,
  ) {
    return this.contentService.createContentComment({ ...payload, userId });
  }

  // -----------   Add content  Reaction   ------------
  @ApiOperation({ summary: 'add conent reaction with  on a content' })
  @ApiBearerAuth()
  @ValidateAuth()
  @Post('/content-reaction')
  createContentReaction(
    @GetUser('userId') userId: string,
    @Body() dto: CreateContentReactionDto,
  ) {
    return this.contentService.createContentReaction({ ...dto, userId });
  }

  // ----------  get comment all comment content   ----------------
  // @ApiOperation({ summary: 'Get all content comments' })
  // @ApiBearerAuth()
  // @ValidateAuth()
  // @Get('content-comment-get')
  // findAllContentComments() {
  //   return this.contentService.findAllContentComments();
  // }

  // -----------   Add Comment Reaction   ------------
  @ApiOperation({ summary: 'Add comment reaction with  on a content' })
  @ApiBearerAuth()
  @ValidateAuth()
  @Post('/content-comment-reaction')
  createContentCommentReaction(
    @GetUser('userId') userId: string,
    @Body() dto: CreateContentCommentReactionDto,
  ) {
    return this.contentService.createContentCommentReaction({ ...dto, userId });
  }
}
