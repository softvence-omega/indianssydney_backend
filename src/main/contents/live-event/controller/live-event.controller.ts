import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetUser, ValidateAuth } from 'src/common/jwt/jwt.decorator';
import { LiveEventService } from '../service/live-event.service';
import { CreateLiveEventDto } from '../dto/create-live-event.dto';
import { UpdateLiveEventDto } from '../dto/update-live-event.dto';

@ApiTags('Live Events for registered users')
@ApiBearerAuth()
@ValidateAuth()
@Controller('live-events')
export class LiveEventController {
  constructor(private readonly liveEventService: LiveEventService) {}

  @Post()
  async createLiveEvent(
    @GetUser('userId') userId: string,
    @Body() dto: CreateLiveEventDto,
  ) {
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

  @Patch(':id')
  async updateLiveEvent(
    @Param('id') id: string,
    @Body() dto: UpdateLiveEventDto,
  ) {
    return this.liveEventService.updateLiveEvent(id, dto);
  }

  @Delete(':id')
  async deleteLiveEvent(@Param('id') id: string) {
    return this.liveEventService.deleteLiveEvent(id);
  }
}
