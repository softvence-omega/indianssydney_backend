import { Injectable } from '@nestjs/common';
import { S3 } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import mime from 'mime-types';

const unlinkAsync = promisify(fs.unlink);

@Injectable()
export class AwsUploadService {
  private s3: S3;

  constructor() {
    this.s3 = new S3({
      region: "us-east-1",
      credentials: {
        accessKeyId:"***REMOVED***", //process.env.ACCESS_KEY!,
        secretAccessKey: "9Hir0MxGWAuVYycl5+oPiT8SpyurOlrF1cT7FOt+",//process.env.ACCESS_SECRET!,
      },
    });
  }

  async uploadFileToS3(localFilePath: string, prefix: string) {
    const fileContent = fs.readFileSync(localFilePath);
    const fileExt = path.extname(localFilePath);
    const fileName = `${prefix}-${path.basename(localFilePath)}`;
    const mimeType = mime.lookup(fileExt) || 'application/octet-stream';

    try {
      const upload = new Upload({
        client: this.s3,
        params: {
          Bucket: process.env.BUCKET_NAME!, // <-- FIX: specify your bucket
          Key: fileName,
          Body: fileContent,
          ContentType: mimeType,
        },
      });

      const result = await upload.done();

      // Delete local file after successful upload
      await unlinkAsync(localFilePath);
      console.log(`🧹 Deleted local file: ${localFilePath}`);

      return {
        url: result.Location,
        key: fileName,
      };
    } catch (error) {
      console.error('❌ Failed to upload or delete file:', error);
      await unlinkAsync(localFilePath);
      console.log(`🧹 Deleted local file: ${localFilePath}`);
      throw error;
    }
  }
}
