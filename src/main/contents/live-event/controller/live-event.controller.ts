import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser, ValidateAuth, ValidateContibutor, ValidateSuperAdmin } from 'src/common/jwt/jwt.decorator';
import { LiveEventService } from '../service/live-event.service';
import { CreateLiveEventDto } from '../dto/create-live-event.dto';
import { UpdateLiveEventDto } from '../dto/update-live-event.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileType, MulterService } from 'src/lib/multer/multer.service';

@ApiTags('Live Events for registered users')
@ApiBearerAuth()
@ValidateAuth()
@Controller('live-events')
export class LiveEventController {
  constructor(private readonly liveEventService: LiveEventService) {}

@ApiOperation({ summary: 'contributor  create live stream' })
@ApiBearerAuth()
@ValidateContibutor()
@Post()
@ApiConsumes('multipart/form-data')  
@UseInterceptors(
  FileInterceptor(
    'thumbnail',  
    new MulterService().createMulterOptions(
      './temp',
      'live-events',
      FileType.IMAGE,
    ),
  ),
)
async createLiveEvent(
  @GetUser('userId') userId: string,
  @Body() dto: CreateLiveEventDto,
  @UploadedFile() file?: Express.Multer.File,
) {
  if (file) dto.thumbnail = file;
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
      'thumbnail',  
      new MulterService().createMulterOptions(
        './temp',
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
    if (file) dto.thumbnail = file;
    return this.liveEventService.updateLiveEvent(id, dto);
  }
}
