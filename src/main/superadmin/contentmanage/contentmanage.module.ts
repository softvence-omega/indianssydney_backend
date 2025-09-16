import { Module } from '@nestjs/common';
import { ContentmanageService } from './service/contentmanage.service';
import { ContentmanageController } from './controller/contentmanage.controller';
import { NotificationModule } from 'src/lib/notificaton/notification.module';
import { SettingsController } from './controller/settings.controller';
import { SettingsService } from './service/settings.service';

@Module({
  imports: [NotificationModule],
  controllers: [ContentmanageController,SettingsController],
  providers: [ContentmanageService,SettingsService],
})
export class ContentmanageModule {}
