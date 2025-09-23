import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { awsService } from './aws.service';

@Controller('s3')
export class awsController {
  constructor(private readonly s3Service: awsService) {}

  @Get('aws-upload-url')
  async getUploadURL(@Query('fileType') fileType: string) {
    if (!fileType) {
      throw new BadRequestException('fileType query param is required');
    }

    const { uploadURL, key } = await this.s3Service.generateUploadURL(fileType);
    return { uploadURL, key };
  }
}
