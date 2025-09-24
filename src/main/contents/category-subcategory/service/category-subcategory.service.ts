import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from '../dto/create-category-subcategory.dto';
import {
  UpdateCategoryDto,

} from '../dto/update-category-subcategory.dto';
import { FileService } from 'src/lib/file/file.service';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { HandleError } from 'src/common/error/handle-error.decorator';
import { successResponse, TResponse } from 'src/common/utils/response.util';
import { AppError } from 'src/common/error/handle-error.app';
import { generateSlug } from 'src/lib/slug/slug.util';

@Injectable()
export class CategorySubcategoryService {
  constructor(
    private readonly fileService: FileService,
    private readonly prisma: PrismaService,
  ) {}

  // ---------------- CATEGORY ----------------
  @HandleError('Failed to create category with subcategories')
  async createCategoryWithSubcategories(
    dto: CreateCategoryDto,
  ): Promise<TResponse> {
    return this.prisma.$transaction(async (tx) => {
      //  Create Category
      const category = await tx.category.create({
        data: {
          name: dto.name,
          tamplate: dto.tamplate,
          slug: generateSlug(dto.name),
        },
      });

      //  Create SubCategories (if provided)
      if (dto.subnames?.length) {
        await tx.subCategory.createMany({
          data: dto.subnames.map((sub) => ({
            subname: sub,
            subslug: generateSlug(sub),
            categoryId: category.id,
          })),
        });
      }

      //  Return Category with SubCategories
      const fullCategory = await tx.category.findUnique({
        where: { id: category.id },
        include: { subCategories: true },
      });

      return successResponse(
        fullCategory,
        'Category with subcategories created successfully',
      );
    });
  }
  // ----------------------------- find all categories -----------------------------
  @HandleError('Failed to fetch categories')
  async findAllCategories(): Promise<TResponse> {
    const categories = await this.prisma.category.findMany({
      include: { subCategories: true },
    });
    return successResponse(categories);
  }
  // ----------------------------- find one category -----------------------------
  @HandleError('Failed to fetch category')
  async findOneCategory(id: string): Promise<TResponse> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { subCategories: true },
    });
    if (!category) throw new AppError(404, 'Category not found');
    return successResponse(category);
  }
  
// ----------------------------- update category + subcategories -----------------------------
@HandleError('Failed to update category and subcategories')
async updateCategoryAndSubcategories(
  id: string,
  dto: UpdateCategoryDto,
): Promise<TResponse> {
  return this.prisma.$transaction(async (tx) => {
    
    const category = await tx.category.findUnique({ where: { id } });
    if (!category) throw new AppError(404, 'Category not found');

    // Update category
    if (dto.name) {
      await tx.category.update({
        where: { id },
        data: {
          tamplate: dto.tamplate,
          name: dto.name,
          slug: generateSlug(dto.name),
        },
      });
    }

    // If subcategories provided, replace them
    if (dto.subnames) {
      // delete old subs
      await tx.subCategory.deleteMany({ where: { categoryId: id } });

      // insert new subs
      await tx.subCategory.createMany({
        data: dto.subnames.map((sub) => ({
          subname: sub,
          subslug: generateSlug(sub),
          categoryId: id,
        
        })),
      });
    }

    // Return updated with subcategories
    const updatedCategory = await tx.category.findUnique({
      where: { id },
      include: { subCategories: true },
    });

    return successResponse(
      updatedCategory,
      'Category and subcategories updated successfully',
    );
  });
}

  // ----------------------------- remove category -----------------------------
  @HandleError('Failed to delete category and subcategories')
  async removeCategory(id: string): Promise<TResponse> {
    return this.prisma.$transaction(async (tx) => {
      //---------  Check if any content is linked to the category itself----------
      const categoryContentCount = await tx.content.count({
        where: { categoryId: id },
      });

      // ---------- Get all subcategory IDs of this category-----------------
      const subCategories = await tx.subCategory.findMany({
        where: { categoryId: id },
        select: { id: true },
      });
      const subCategoryIds = subCategories.map((sub) => sub.id);

      // ------------- Check if any content is linked to any subcategory------------
      let subCategoryContentCount = 0;
      if (subCategoryIds.length > 0) {
        subCategoryContentCount = await tx.content.count({
          where: { subCategoryId: { in: subCategoryIds } },
        });
      }

      // ------------ If any content exists, throw error
      if (categoryContentCount > 0 || subCategoryContentCount > 0) {
        throw new AppError(
          400,
          'Cannot delete category: it or its subcategories are used by one or more contents',
        );
      }

      // ----------- Delete subcategories first-----------
      if (subCategoryIds.length > 0) {
        await tx.subCategory.deleteMany({
          where: { id: { in: subCategoryIds } },
        });
      }

      // -------------Delete category-------------
      await tx.category.delete({ where: { id } });

      return successResponse(
        null,
        'Category and its subcategories deleted successfully',
      );
    });
  }

  // ----------------------------- SUBCATEGORY -----------------------------
  @HandleError('Failed to fetch subcategories')
  async findAllSubcategories(): Promise<TResponse> {
    const subcategories = await this.prisma.subCategory.findMany({
      include: { category: true },
    });
    return successResponse(subcategories);
  }
  // ------------find one subcategory--------------------
  @HandleError('Failed to fetch subcategory')
  async findOneSubcategory(id: string): Promise<TResponse> {
    const subcategory = await this.prisma.subCategory.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!subcategory) throw new AppError(404, 'Subcategory not found');
    return successResponse(subcategory);
  }

  // slug get subcategory--
@HandleError('Failed to fetch subcategory')
  async findOneSubcategoryBySlug( subslug : string) {
  const subcategory = await this.prisma.subCategory.findUnique({
    where: {  subslug  },
  });

  if (!subcategory) {
    throw new AppError(404, `Subcategory with slug "${ subslug }" not found`);
  }

  return successResponse(subcategory, 'Subcategory fetched successfully');
}

// ----slug 
@HandleError('Failed to fetch category')
async findOnecategoryBySlug(slug: string) {
  const category = await this.prisma.category.findUnique({
    where: { slug },
  });

  if (!category) {
    throw new AppError(404, `Category with slug "${slug}" not found`);
  }

  return successResponse(category, 'Category fetched successfully');
}


}
