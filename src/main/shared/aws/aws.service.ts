import { Injectable } from '@nestjs/common';
import * as aws from 'aws-sdk';
import * as crypto from 'crypto';
import { ENVEnum } from 'src/common/enum/env.enum';
import { promisify } from 'util';

const randomBytes = promisify(crypto.randomBytes);

@Injectable()
export class awsService {
  private s3: aws.S3;
  private bucketName: string;

  constructor() {
    const region = 'us-east-1';
    this.bucketName = 'direct-upload-s3-bucket-thing';

    this.s3 = new aws.S3({
      region,
      accessKeyId: ENVEnum.AWS_ACCESS_KEY_ID,
      secretAccessKey: ENVEnum.AWS_SECRET_ACCESS_KEY,
      signatureVersion: 'v4',
    });
  }

  /**
   * Generate a pre-signed upload URL for S3
   * @param fileType MIME type of file (e.g. image/png, video/mp4, audio/mpeg)
   */

  async generateUploadURL(
    fileType: string,
  ): Promise<{ uploadURL: string; key: string }> {
    try {
      const rawBytes = crypto.randomBytes(16);
      const ext = fileType.split('/')[1] || 'bin';
      const key = `${rawBytes.toString('hex')}.${ext}`;

      const params = {
        Bucket: this.bucketName,
        Key: key,
        Expires: 300,
        ContentType: fileType,
      };

      const uploadURL = await this.s3.getSignedUrlPromise('putObject', params);
      return { uploadURL, key };
    } catch (err) {
      console.error('❌ S3 Signed URL Error:', err);
      throw err;
    }
  }
}
