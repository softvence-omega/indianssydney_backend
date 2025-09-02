import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
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
import { GetUser, ValidateSuperAdmin } from 'src/common/jwt/jwt.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { FileType, MulterService } from 'src/lib/multer/multer.service';

@ApiTags('Contents')
@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @ApiOperation({ summary: 'Create new content with files and additional data' })
  @ApiBearerAuth()
  @ValidateSuperAdmin()
  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateContentDto })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'mainImage', maxCount: 1 },
        { name: 'videoFile', maxCount: 1 },
        { name: 'videoThumbnail', maxCount: 1 },
        { name: 'audioFile', maxCount: 1 },
        { name: 'additionalImages', maxCount: 1 },
        { name: 'additionalAudios', maxCount: 1 },
        { name: 'additionalThumbnails', maxCount: 1 },
      ],
      new MulterService().createMulterOptions('./temp', 'temp', FileType.ANY),
    ),
  )
  async createContent(
    @Body() dto: CreateContentDto,
    @GetUser('id') userId: string,
    @UploadedFiles()
    files: {
      mainImage?: Express.Multer.File[];
      videoFile?: Express.Multer.File[];
      videoThumbnail?: Express.Multer.File[];
      audioFile?: Express.Multer.File[];
      additionalImages?: Express.Multer.File[];
      additionalAudios?: Express.Multer.File[];
      additionalThumbnails?: Express.Multer.File[];
    },
  ) {
    return this.contentService.create(dto, userId, files);
  }

  // @Get()
  // findAll() {
  //   return this.contentService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.contentService.findOne(id);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contentService.remove(id);
  }
}
