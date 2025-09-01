import { Injectable } from '@nestjs/common';
import {
  CreateCategoryDto,
  CreateSubcategoryDto,
} from '../dto/create-category-subcategory.dto';
import {
  UpdateCategoryDto,
  UpdateSubcategoryDto,
} from '../dto/update-category-subcategory.dto';
import { FileService } from 'src/lib/file/file.service';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { HandleError } from 'src/common/error/handle-error.decorator';
import { successResponse, TResponse } from 'src/common/utils/response.util';
import { AppError } from 'src/common/error/handle-error.app';

@Injectable()
export class CategorySubcategoryService {
  constructor(
    private readonly fileService: FileService,
    private readonly prisma: PrismaService,
  ) {}

  // ---------------- CATEGORY ----------------
  @HandleError('Failed to create Category', 'Category only admin')
  async createCategory(payload: CreateCategoryDto): Promise<TResponse<any>> {
    let fileUrl: string | null = null;

    if (payload.file) {
      const fileInstance = await this.fileService.processUploadedFile(
        payload.file,
      );
      fileUrl = fileInstance.url;
    }

    const category = await this.prisma.category.create({
      data: {
        name: payload.name,
        description: payload.description,
        icon: fileUrl,
        createdAt: new Date().toISOString(),
      },
    });

    return successResponse(category, 'Category created successfully');
  }

  async findAllCategories() {
    const categories = await this.prisma.category.findMany({
      include: { subCategories: true },
    });
    return successResponse(categories);
  }

  async findOneCategory(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { subCategories: true },
    });
    if (!category) throw new AppError(404, 'Category not found');
    return successResponse(category);
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    let fileUrl: string | undefined;

    if (dto.file) {
      const fileInstance = await this.fileService.processUploadedFile(dto.file);
      fileUrl = fileInstance.url;
    }

    const updated = await this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description && { description: dto.description }),
        ...(fileUrl && { icon: fileUrl }), // only update if file uploaded
      },
    });

    return successResponse(updated, 'Category updated successfully');
  }

  async removeCategory(id: string) {
    await this.prisma.category.delete({ where: { id } });
    return successResponse(null, 'Category deleted successfully');
  }

  // ----------------------------- SUBCATEGORY -----------------------------
  @HandleError('Failed to create Subcategory', 'Subcategory only admin')
  async createSubcategory(
    payload: CreateSubcategoryDto,
  ): Promise<TResponse<any>> {
    const subcategory = await this.prisma.subCategory.create({
      data: {
        name: payload.name,
        description: payload.description,
        categoryId: payload.categoryId,
      },
    });
    return successResponse(subcategory, 'Subcategory created successfully');
  }

  async findAllSubcategories() {
    const subcategories = await this.prisma.subCategory.findMany({
      include: { category: true },
    });
    return successResponse(subcategories);
  }
  // ------------find one subcategory--------------------
  async findOneSubcategory(id: string) {
    const subcategory = await this.prisma.subCategory.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!subcategory) throw new AppError(404, 'Subcategory not found');
    return successResponse(subcategory);
  }
  // ---------------update subcategory------------------
  async updateSubcategory(id: string, dto: UpdateSubcategoryDto) {
    const updated = await this.prisma.subCategory.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description && { description: dto.description }),
      },
    });
    return successResponse(updated, 'Subcategory updated successfully');
  }
  // --------------remove subcategory----------------------
  async removeSubcategory(id: string) {
    await this.prisma.subCategory.delete({ where: { id } });
    return successResponse(null, 'Subcategory deleted successfully');
  }
}
