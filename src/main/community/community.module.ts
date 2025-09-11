import { Module } from '@nestjs/common';
import { CommunityService } from './service/community.service';
import { CommunityController } from './controller/community.controller';

@Module({
  controllers: [CommunityController],
  providers: [CommunityService],
})
export class CommunityModule {}
