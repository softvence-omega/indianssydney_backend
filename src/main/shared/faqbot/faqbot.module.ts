import { Module } from '@nestjs/common';

import { HttpModule } from '@nestjs/axios';
import { FaqbotController } from './controller/faqbot.controller';
import { FaqbotService } from './services/faqbot.service';


@Module({
  imports: [HttpModule],
  controllers: [FaqbotController],
  providers: [FaqbotService],
})
export class FaqbotModule {}

