import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateContentDto } from '../dto/create-content.dto';
import { FileService } from 'src/lib/file/file.service';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { successResponse, TResponse } from 'src/common/utils/response.util';
import { HandleError } from 'src/common/error/handle-error.decorator';

@Injectable()
export class ContentService {
  constructor(
    private readonly fileService: FileService,
    private readonly prisma: PrismaService,
  ) {}

  // ---------- Create Content ------------------------------
  @HandleError('Failed to create content', 'content')
  async create(
    payload: CreateContentDto,
    userId: string,
    files: {
      image?: Express.Multer.File[];
      videoFile?: Express.Multer.File[];
      videothamble?: Express.Multer.File[];
      audioFile?: Express.Multer.File[];
      additionalImage?: Express.Multer.File[];
      additionalAudio?: Express.Multer.File[];
      additionalThumbail?: Express.Multer.File[];
    },
  ): Promise<TResponse<any>> {
    try {
      // ---------------- Main file uploads ----------------
      const imageUrl = files?.image?.[0]
        ? (await this.fileService.processUploadedFile(files.image[0])).url
        : null;
      const videoUrl = files?.videoFile?.[0]
        ? (await this.fileService.processUploadedFile(files.videoFile[0])).url
        : null;
      const videoThumbUrl = files?.videothamble?.[0]
        ? (await this.fileService.processUploadedFile(files.videothamble[0]))
            .url
        : null;
      const audioUrl = files?.audioFile?.[0]
        ? (await this.fileService.processUploadedFile(files.audioFile[0])).url
        : null;

      // ---------------- Additional field uploads ----------------
      const additionalImages: string[] = [];
      const additionalAudios: string[] = [];
      const additionalThumbnails: string[] = [];

      if (files?.additionalImage) {
        for (const f of files.additionalImage) {
          additionalImages.push(
            (await this.fileService.processUploadedFile(f)).url,
          );
        }
      }

      if (files?.additionalAudio) {
        for (const f of files.additionalAudio) {
          additionalAudios.push(
            (await this.fileService.processUploadedFile(f)).url,
          );
        }
      }

      if (files?.additionalThumbail) {
        for (const f of files.additionalThumbail) {
          additionalThumbnails.push(
            (await this.fileService.processUploadedFile(f)).url,
          );
        }
      }

      // ---------------- Transaction: create Content + AdditionalField ----------------
      const content = await this.prisma.$transaction(async (tx) => {
        let additionalFieldId: string | null = null;

        // ---------------Create AdditionalField if provided-----------------
        if (
          additionalImages.length ||
          additionalAudios.length ||
          additionalThumbnails.length
        )
          // 2️ Create Content and connect AdditionalField
          return tx.content.create({
            data: {
              title: payload.title,
              subTitle: payload.subTitle,
              paragraph: payload.paragraph,
              shortQuote: payload.shortQuote,
              image: imageUrl ?? undefined,
              videoFile: videoUrl ?? undefined,
              videoThumbnail: videoThumbUrl ?? undefined,
              audioFile: audioUrl ?? undefined,
              imageCaption: payload.imageCaption,
              tags: payload.tags ?? [],
              contentType: payload.contentType,
              userId,
              categoryId: payload.categoryId,
              subCategoryId: payload.subCategoryId,
            },
          });
      });

      return successResponse(content, 'Content created successfully');
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Failed to create content',
      );
    }
  }

  // ---------- Find All Contents ------------------------------
  async findAll(): Promise<TResponse<any>> {
    const contents = await this.prisma.content.findMany({
      include: {
        user: {
          select: { id: true, fullName: true, email: true, profilePhoto: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(contents, 'All contents fetched successfully');
  }

  // ---------- Find One Content ------------------------------
  async findOne(id: string): Promise<TResponse<any>> {
    const content = await this.prisma.content.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, profilePhoto: true },
        },
      },
    });

    if (!content) throw new BadRequestException('Content not found');

    return successResponse(content, 'Content fetched successfully');
  }

  // ---------- Delete Content ------------------------------
  async remove(id: string): Promise<TResponse<any>> {
    await this.prisma.content.delete({ where: { id } });
    return successResponse(null, 'Content deleted successfully');
  }
}
