import { Injectable } from '@nestjs/common';
import { CreateLiveEventDto } from './dto/create-live-event.dto';
import { UpdateLiveEventDto } from './dto/update-live-event.dto';

@Injectable()
export class LiveEventService {
  create(createLiveEventDto: CreateLiveEventDto) {
    return 'This action adds a new liveEvent';
  }

  findAll() {
    return `This action returns all liveEvent`;
  }

  findOne(id: number) {
    return `This action returns a #${id} liveEvent`;
  }

  update(id: number, updateLiveEventDto: UpdateLiveEventDto) {
    return `This action updates a #${id} liveEvent`;
  }

  remove(id: number) {
    return `This action removes a #${id} liveEvent`;
  }
}
