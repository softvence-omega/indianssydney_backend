import { Injectable } from '@nestjs/common';
import * as aws from 'aws-sdk';
import * as crypto from 'crypto';
import { ENVEnum } from 'src/common/enum/env.enum';
import { promisify } from 'util';

const randomBytes = promisify(crypto.randomBytes);

@Injectable()
export class S3Service {
  private s3: aws.S3;
  private bucketName: string;

  constructor() {
    const region = 'us-west-2';
    this.bucketName = 'direct-upload-s3-bucket-thing';
    const accessKeyId = ENVEnum.AWS_ACCESS_KEY_ID;
    const secretAccessKey = ENVEnum.AWS_SECRET_ACCESS_KEY;

    this.s3 = new aws.S3({
      region,
      accessKeyId,
      secretAccessKey,
      signatureVersion: 'v4',
    });
  }

  async generateUploadURL(): Promise<string> {
    const rawBytes = await randomBytes(16);
    const imageName = rawBytes.toString('hex');

    const params = {
      Bucket: this.bucketName,
      Key: imageName,
      Expires: 60,
    };

    const uploadURL = await this.s3.getSignedUrlPromise('putObject', params);
    return uploadURL;
  }
}
