import { Module } from '@nestjs/common';
import { ContentmanageService } from './service/contentmanage.service';
import { ContentmanageController } from './controller/contentmanage.controller';
import { NotificationModule } from 'src/lib/notificaton/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [ContentmanageController],
  providers: [ContentmanageService],
})
export class ContentmanageModule {}
