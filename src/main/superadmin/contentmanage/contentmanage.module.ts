import { Module } from '@nestjs/common';
import { ContentmanageService } from './service/contentmanage.service';
import { ContentmanageController } from './controller/contentmanage.controller';

@Module({
  controllers: [ContentmanageController],
  providers: [ContentmanageService],
})
export class ContentmanageModule {}
