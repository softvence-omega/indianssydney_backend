import { Module } from '@nestjs/common';
import { SubscribeService } from './services/subscribe.service';
import { subscribeController } from './controller/subscribe.controller';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [subscribeController],
  providers: [SubscribeService],
})
export class SubscribeModule {}
