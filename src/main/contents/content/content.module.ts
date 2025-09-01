import { Module } from '@nestjs/common';
import { ContentService } from './service/content.service';
import { ContentController } from './controller/content.controller';

@Module({
  controllers: [ContentController],
  providers: [ContentService],
})
export class ContentModule {}
