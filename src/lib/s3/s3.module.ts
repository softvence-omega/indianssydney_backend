import { Global, Module } from '@nestjs/common';
import { MulterServiceAws } from './s3.service';

@Global()
@Module({
  providers: [MulterServiceAws],
  exports: [MulterServiceAws],
})
export class S3FileModule {}
