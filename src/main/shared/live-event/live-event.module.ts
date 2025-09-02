import { Module } from '@nestjs/common';
import { LiveEventService } from './live-event.service';
import { LiveEventController } from './live-event.controller';

@Module({
  controllers: [LiveEventController],
  providers: [LiveEventService],
})
export class LiveEventModule {}
