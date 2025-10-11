import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  GetUser,
  ValidateAuth,
  ValidateContibutor,
  ValidateSuperAdmin,
} from 'src/common/jwt/jwt.decorator';
import { LiveEventService } from '../service/live-event.service';
import { CreateLiveEventDto } from '../dto/create-live-event.dto';
import { UpdateLiveEventDto } from '../dto/update-live-event.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileType, MulterService } from 'src/lib/multer/multer.service';
import uploadFileToS3 from 'src/lib/utils/uploadImageAWS';
import { promises as fs } from 'fs';

@ApiTags('Live Events for registered users')
@ApiBearerAuth()
@ValidateAuth()
@Controller('live-events')
export class LiveEventController {
  constructor(private readonly liveEventService: LiveEventService) {}

  @ApiOperation({ summary: 'Contributor create live stream' })
  @ApiBearerAuth()
  @ValidateContibutor()
  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor(
      'thumbnail', // <-- match the form-data field
      new MulterService().createMulterOptions(
        './uploads',
        'content',
        FileType.ANY,
      ),
    ),
  )
  async createLiveEvent(
    @GetUser('userId') userId: string,
    @Body() dto: CreateLiveEventDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      // Upload thumbnail to S3
      const s3Result = await uploadFileToS3(file.path);

      // Assign S3 URL to DTO for service
      dto.thumbnail = file;
      dto['thumbnailS3'] = s3Result.url;

      try {
        await fs.unlink(file.path);
      } catch (err) {
        console.warn('⚠️ Failed to delete temp thumbnail file:', err);
      }
    }

    return this.liveEventService.createLiveEvent(userId, dto);
  }
  @Get()
  async getLiveEvents() {
    return this.liveEventService.getLiveEvents();
  }

  @Get(':id')
  async getLiveEventById(@Param('id') id: string) {
    return this.liveEventService.getLiveEventById(id);
  }

  @ApiOperation({ summary: 'Super Admin deleted live stream' })
  @ApiBearerAuth()
  @ValidateSuperAdmin()
  @Delete(':id')
  async deleteLiveEvent(@Param('id') id: string) {
    return this.liveEventService.deleteLiveEvent(id);
  }
  // ------update live stream------
  @ApiOperation({ summary: 'Super Admin edited live stream' })
  @ApiBearerAuth()
  @ValidateSuperAdmin()
  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor(
      'thumbnail', // Must match the form-data field
      new MulterService().createMulterOptions(
        './uploads',
        'live-events',
        FileType.IMAGE,
      ),
    ),
  )
  async updateLiveEvent(
    @Param('id') id: string,
    @Body() dto: UpdateLiveEventDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      // Upload thumbnail to S3
      const s3Result = await uploadFileToS3(file.path);

      // Pass S3 URL to service
      dto.thumbnail = file; // keep the file for compatibility
      dto['thumbnailS3'] = s3Result.url; // new property for S3 URL

      // Delete local temp file
      try {
        await fs.unlink(file.path);
      } catch (err) {
        console.warn('⚠️ Failed to delete temp thumbnail:', err);
      }
    }

    return this.liveEventService.updateLiveEvent(id, dto);
  }
}
