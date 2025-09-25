import { Injectable } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { FileService } from 'src/lib/file/file.service';
import { HandleError } from 'src/common/error/handle-error.decorator';
import { AppError } from 'src/common/error/handle-error.app';
import { TResponse } from 'src/common/utils/response.util';
import { CreateAustraliaLawDto } from '../dto/create-australia-law.dto';
import { UpdateAustraliaLawDto } from '../dto/update-australia-law.dto';
import { HttpService } from '@nestjs/axios';
interface ExternalApiResponse {
  description?: string;
  files: string[] | { url: string }[];
}

@Injectable()
export class AustraliaLawService {
  private readonly externalApi =
    'https://theaustraliancanvas.onrender.com/files/upload_multiple';

  constructor(
    private readonly fileService: FileService,
    private readonly prisma: PrismaService,
       private readonly httpService: HttpService,
  ) {}

  @HandleError('Error creating Australia law')
  async createAustraliaLaw(
    dto: CreateAustraliaLawDto,
    files: Express.Multer.File[],
  ): Promise<TResponse<any>> {
    if (!files || !files.length) {
      throw new AppError(400, 'At least one file is required');
    }

    // Validate file types and sizes
    for (const file of files) {
      if (!file.mimetype.includes('pdf')) {
        throw new AppError(400, 'Only PDF files are allowed');
      }
      if (file.size > 10 * 1024 * 1024) {
        throw new AppError(400, 'File size exceeds 10MB limit');
      }
    }

    try {
      // Prepare form-data for external API
      const form = new FormData();
      if (dto.description) form.append('description', dto.description);
      files.forEach((file) => form.append('files', file.buffer, file.originalname));

      console.log('FormData:', form);

      // Upload to external API
      const { data } = await axios.post<ExternalApiResponse>(this.externalApi, form, {
        headers: {
          ...form.getHeaders(),
        },
      });

      console.log('External API response:', data);

      // Validate external API response
      if (!data || !data.files) {
        throw new AppError(500, 'Invalid response from external API');
      }

      // Save external API response in DB
      const australiaLaw = await this.prisma.australiaLaw.create({
        data: {
          description: data.description ?? dto.description,
          files: JSON.stringify(data.files || []),
        },
      });

      return {
        success: true,
        message: 'Australia law created successfully',
        data: australiaLaw,
      };
    } catch (error) {
      console.error('Error in createAustraliaLaw:', error);
      throw new AppError(500, `Failed to create Australia law: ${error.message}`);
    }
  }

  async findAll() {
    const records = await this.prisma.australiaLaw.findMany();
    return records.map((r) => ({
      ...r,
      files: JSON.parse(r.files || '[]'),
    }));
  }

  async findOne(id: string) {
    const record = await this.prisma.australiaLaw.findUnique({ where: { id } });
    if (!record) throw new AppError(404, 'Record not found');
    return { ...record, files: JSON.parse(record.files || '[]') };
  }

  async update(id: string, dto: UpdateAustraliaLawDto) {
    const { files, ...updateData } = dto;
    const updated = await this.prisma.australiaLaw.update({
      where: { id },
      data: updateData,
    });
    return { success: true, data: updated };
  }

  async remove(id: string) {
    await this.prisma.australiaLaw.delete({ where: { id } });
    return { success: true, message: 'Record deleted successfully' };
  }
}