import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CategorySubcategoryService } from '../service/category-subcategory.service';
import { CreateCategoryDto } from '../dto/create-category-subcategory.dto';
import { UpdateCategoryDto } from '../dto/update-category-subcategory.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ValidateAdmin } from 'src/common/jwt/jwt.decorator';

@ApiTags('Category & Subcategory Management')
@Controller('category-subcategory')
export class CategorySubcategoryController {
  constructor(
    private readonly categorySubcategoryService: CategorySubcategoryService,
  ) {}

  // -------------------- CATEGORY -------------------
  @ApiOperation({ summary: 'Create a new category (Admin only)' })
  @ApiBearerAuth()
  @ValidateAdmin()
  @Post('create')
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categorySubcategoryService.createCategoryWithSubcategories(
      createCategoryDto,
    );
  }

  @Get('category')
  findAllCategories() {
    return this.categorySubcategoryService.findAllCategories();
  }

  @Get('category/:id')
  findOneCategory(@Param('id') id: string) {
    return this.categorySubcategoryService.findOneCategory(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ValidateAdmin()
  async updateCategory(
    @Param('id') id: string,

    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categorySubcategoryService.updateCategory(id, { ...dto });
  }

  @Delete('category/:id')
  removeCategory(@Param('id') id: string) {
    return this.categorySubcategoryService.removeCategory(id);
  }

  // -------------------- SUBCATEGORY -------------------

  @Get('subcategory')
  findAllSubcategories() {
    return this.categorySubcategoryService.findAllSubcategories();
  }

  @Get('subcategory/:id')
  findOneSubcategory(@Param('id') id: string) {
    return this.categorySubcategoryService.findOneSubcategory(id);
  }

  @Get('subcategory/slug/:slug')
  findOneSubcategoryBySlug(@Param(' subslug ') subslug: string) {
    return this.categorySubcategoryService.findOneSubcategoryBySlug(subslug);
  }

  @Get('category/slug/:slug')
  findOnecategoryBySlug(@Param('slug') slug: string) {
    return this.categorySubcategoryService.findOnecategoryBySlug(slug);
  }
}
