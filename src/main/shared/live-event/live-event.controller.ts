import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LiveEventService } from './live-event.service';
import { CreateLiveEventDto } from './dto/create-live-event.dto';
import { UpdateLiveEventDto } from './dto/update-live-event.dto';

@Controller('live-event')
export class LiveEventController {
  constructor(private readonly liveEventService: LiveEventService) {}

  @Post()
  create(@Body() createLiveEventDto: CreateLiveEventDto) {
    return this.liveEventService.create(createLiveEventDto);
  }

  @Get()
  findAll() {
    return this.liveEventService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.liveEventService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLiveEventDto: UpdateLiveEventDto) {
    return this.liveEventService.update(+id, updateLiveEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.liveEventService.remove(+id);
  }
}
