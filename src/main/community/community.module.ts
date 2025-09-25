import { Module } from '@nestjs/common';
import { CommunityService } from './service/community.service';
import { CommunityController } from './controller/community.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [CommunityController],
  providers: [CommunityService],
})
export class CommunityModule {}
