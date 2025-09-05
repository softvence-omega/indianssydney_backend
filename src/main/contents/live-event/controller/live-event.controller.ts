import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetUser, ValidateAuth } from 'src/common/jwt/jwt.decorator';
import { LiveEventService } from '../service/live-event.service';
import { CreateLiveEventDto } from '../dto/create-live-event.dto';

@ApiTags('Live Events for reguestered users')
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
}
