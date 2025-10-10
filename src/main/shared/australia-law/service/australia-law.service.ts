import { Injectable } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { HandleError } from 'src/common/error/handle-error.decorator';
import { AppError } from 'src/common/error/handle-error.app';
import { TResponse } from 'src/common/utilsResponse/response.util';
import { CreateAustraliaLawDto } from '../dto/create-australia-law.dto';
import { UpdateAustraliaLawDto } from '../dto/update-australia-law.dto';

interface ExternalApiResponse {
  description?: string;
  files: string[] | { url: string }[];
}

@Injectable()
export class AustraliaLawService {
  private readonly externalApi =
    'https://ai.australiancanvas.com/files/upload-multiple';

  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Error creating Australia law')
  async createAustraliaLaw(
    dto: CreateAustraliaLawDto,
    files: Express.Multer.File[],
  ): Promise<TResponse<any>> {
    if (!files || !files.length) {
      throw new AppError(400, 'At least one file is required');
    }

    // -------  Validate file types and sizes. ------
    for (const file of files) {
      if (!file.mimetype.includes('pdf')) {
        throw new AppError(400, 'Only PDF files are allowed');
      }
      if (file.size > 10 * 1024 * 1024) {
        throw new AppError(400, 'File size exceeds 10MB limit');
      }
    }

    try {
      const form = new FormData();
      if (dto.description) form.append('description', dto.description);

      for (const file of files) {
        form.append('files', file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        });
      }

      //  ---     upload files to external api.  ---
      const { data } = await axios.post<ExternalApiResponse>(
        this.externalApi,
        form,
        {
          headers: form.getHeaders(),
        },
      );

      console.log(' External API response:', data);

      // --  Validate API response--
      if (!data || !data.files || !Array.isArray(data.files)) {
        throw new AppError(500, 'Invalid response from external API');
      }

      // ------ Save record in database
      const australiaLaw = await this.prisma.australiaLaw.create({
        data: {
          description: data.description ?? dto.description ?? '',
          files: JSON.stringify(data.files),
        },
      });

      return {
        success: true,
        message: 'Australia law created successfully',
        data: australiaLaw,
      };
    } catch (error) {
      console.error(' Error in createAustraliaLaw:', error?.message || error);
      throw new AppError(
        500,
        `Failed to create Australia law: ${
          error?.response?.data?.message || error.message
        }`,
      );
    }
  }

  // --------- Find all records---------
  async findAll(): Promise<TResponse<any>> {
    const records = await this.prisma.australiaLaw.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      message: 'Records fetched successfully',
      data: records.map((r) => ({
        ...r,
        files: JSON.parse(r.files || '[]'),
      })),
    };
  }

  // ----  Find one record. ---
  async findOne(id: string): Promise<TResponse<any>> {
    const record = await this.prisma.australiaLaw.findUnique({ where: { id } });
    if (!record) throw new AppError(404, 'Record not found');
    return {
      success: true,
      message: 'Record fetched successfully',
      data: { ...record, files: JSON.parse(record.files || '[]') },
    };
  }

  // ----- Update record. ---
  async update(
    id: string,
    dto: UpdateAustraliaLawDto,
  ): Promise<TResponse<any>> {
    const updated = await this.prisma.australiaLaw.update({
      where: { id },
      data: {
        description: dto.description,
        ...(dto.files ? { files: JSON.stringify(dto.files) } : {}),
      },
    });
    return {
      success: true,
      message: 'Record updated successfully',
      data: updated,
    };
  }

  //  ---- Delete record. --
  async remove(id: string): Promise<TResponse<any>> {
    await this.prisma.australiaLaw.delete({ where: { id } });
    return {
      success: true,
      message: 'Record deleted successfully',
      data: null,
    };
  }
}
