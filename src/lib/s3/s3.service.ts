import { Injectable } from '@nestjs/common';
import { S3 } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import sharp from 'sharp';
import * as path from 'path';
import { v4 as uuid } from 'uuid';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export enum FileType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  VIDEO = 'video',
  AUDIO = 'audio',
  ANY = 'any',
  PDF = 'pdf',
}

@Injectable()
export class MulterServiceAws {
  private s3: S3;
  private mimeTypesMap = {
    [FileType.IMAGE]: ['image/jpeg', 'image/png', 'image/webp'],
    [FileType.DOCUMENT]: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    [FileType.VIDEO]: ['video/mp4', 'video/webm', 'video/ogg'],
    [FileType.AUDIO]: ['audio/mpeg', 'audio/ogg', 'audio/wav'],
    [FileType.PDF]: ['application/pdf'],
  };

  constructor() {
    this.s3 = new S3({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.ACCESS_KEY!,
        secretAccessKey: process.env.ACCESS_SECRET!,
      },
    });
  }

  private async processImage(buffer: Buffer): Promise<Buffer> {
    try {
      return await sharp(buffer)
        .resize({
          width: 1024, 
          height: 1024, 
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 80, progressive: true }) 
        .toBuffer();
    } catch (error) {
      throw new Error(`Image processing failed: ${error.message}`);
    }
  }

  public createMulterOptions(
    bucketName: string,
    prefix: string,
    fileType: FileType = FileType.IMAGE,
    fileSizeLimit = 10 * 1024 * 1024,
    customMimeTypes?: string[],
  ): MulterOptions {
    const allowedMimeTypes =
      fileType === FileType.ANY
        ? null
        : customMimeTypes || this.mimeTypesMap[fileType] || [];

    return {
      limits: {
        fileSize: fileSizeLimit,
      },
      fileFilter: (req, file, cb) => {
        if (!allowedMimeTypes || allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
        }
      },
      storage: {
        async _handleFile(req, file, cb) {
          try {
            const ext = path.extname(file.originalname);
            const fileName = `${prefix}-${uuid()}${ext}`;
            let fileBuffer = file.buffer;

            // Process images only
            if (fileType === FileType.IMAGE && allowedMimeTypes && allowedMimeTypes.includes(file.mimetype)) {
              fileBuffer = await this.processImage(file.buffer);
            }

            const upload = new Upload({
              client: this.s3,
              params: {
                Bucket: bucketName,
                Key: fileName,
                Body: fileBuffer,
                ContentType: file.mimetype,
              },
            });

            const result = await upload.done();
            
            cb(null, {
              path: fileName,
              url: result.Location,
              size: fileBuffer.length,
              mimetype: file.mimetype,
            });
          } catch (error) {
            cb(error);
          }
        },
        _removeFile(req, file, cb) {
          // Optional: Implement file deletion from S3
          this.s3.deleteObject(
            {
              Bucket: bucketName,
              Key: file.path,
            },
            (err) => cb(err)
          );
        },
      },
    };
  }
}