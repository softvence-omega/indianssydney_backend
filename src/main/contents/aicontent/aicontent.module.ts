import { Module } from '@nestjs/common';
import { AicontentService } from './service/aicontent.service';
import { AicontentController } from './controller/aicontent.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [AicontentController],
  providers: [AicontentService],
})
export class AicontentModule {}
