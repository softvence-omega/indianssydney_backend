import { Controller, Get } from '@nestjs/common';
import { awsService } from './aws.service';

@Controller('s3')
export class awsController {
  constructor(private readonly s3Service: awsService) {}

  @Get('aws-upload-url')
  async getUploadURL() {
    const { uploadURL, key } = await this.s3Service.generateUploadURL();
    return { uploadURL, key };
  }
}
