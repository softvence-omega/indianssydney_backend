import { Global, Module } from '@nestjs/common';
import { awsService } from './aws.service';
import { awsController } from './aws.controller';

@Global()
@Module({
  providers: [awsService],
  exports: [awsService],
  controllers: [awsController],
})
export class awsModule {}
