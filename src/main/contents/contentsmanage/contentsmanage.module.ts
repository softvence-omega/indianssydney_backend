import { Module } from '@nestjs/common';
import { ContentsmanageService } from './service/contentsmanage.service';
import { ContentsmanageController } from './controller/contentsmanage.controller';

@Module({
  controllers: [ContentsmanageController],
  providers: [ContentsmanageService],
})
export class ContentsmanageModule {}
