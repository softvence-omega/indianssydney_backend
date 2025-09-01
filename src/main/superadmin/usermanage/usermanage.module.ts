import { Module } from '@nestjs/common';
import { UsermanageService } from './service/usermanage.service';
import { UsermanageController } from './controller/usermanage.controller';

@Module({
  controllers: [UsermanageController],
  providers: [UsermanageService],
})
export class UsermanageModule {}
