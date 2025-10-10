import { Module } from '@nestjs/common';
import { LiveEventService } from './service/live-event.service';
import { LiveEventController } from './controller/live-event.controller';

@Module({
  controllers: [LiveEventController],
  providers: [LiveEventService],
})
export class LiveEventModule {}
