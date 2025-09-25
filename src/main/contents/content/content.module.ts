import { Module } from '@nestjs/common';
import { ContentService } from './service/content.service';
import { ContentController } from './controller/content.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports:[HttpModule],
  controllers: [ContentController],
  providers: [ContentService],
})
export class ContentModule {}
