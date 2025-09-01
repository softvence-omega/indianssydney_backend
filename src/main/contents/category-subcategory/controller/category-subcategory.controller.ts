import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { CategorySubcategoryService } from '../service/category-subcategory.service';
import {
  CreateCategoryDto,
  CreateSubcategoryDto,
} from '../dto/create-category-subcategory.dto';
import {
  UpdateCategoryDto,
  UpdateSubcategoryDto,
} from '../dto/update-category-subcategory.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ValidateAdmin } from 'src/common/jwt/jwt.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileType, MulterService } from 'src/lib/multer/multer.service';

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
  @Post('category/create')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor(
      'file',
      new MulterService().createMulterOptions(
        './temp',
        'categories',
        FileType.IMAGE,
      ),
    ),
  )
  async createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) createCategoryDto.file = file;
    return this.categorySubcategoryService.createCategory(createCategoryDto);
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
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateCategoryDto })
  @UseInterceptors(FileInterceptor('file'))
  async updateCategory(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categorySubcategoryService.updateCategory(id, { ...dto, file });
  }

  @Delete('category/:id')
  removeCategory(@Param('id') id: string) {
    return this.categorySubcategoryService.removeCategory(id);
  }

  // -------------------- SUBCATEGORY -------------------
  @ApiOperation({ summary: 'Create a new subcategory (Admin only)' })
  @ApiBearerAuth()
  @ValidateAdmin()
  @Post('subcategory/create')
  async createSubcategory(@Body() createSubcategoryDto: CreateSubcategoryDto) {
    return this.categorySubcategoryService.createSubcategory(
      createSubcategoryDto,
    );
  }

  @Get('subcategory')
  findAllSubcategories() {
    return this.categorySubcategoryService.findAllSubcategories();
  }

  @Get('subcategory/:id')
  findOneSubcategory(@Param('id') id: string) {
    return this.categorySubcategoryService.findOneSubcategory(id);
  }

  @Patch('subcategory/:id')
  updateSubcategory(
    @Param('id') id: string,
    @Body() updateSubcategoryDto: UpdateSubcategoryDto,
  ) {
    return this.categorySubcategoryService.updateSubcategory(
      id,
      updateSubcategoryDto,
    );
  }

  @Delete('subcategory/:id')
  removeSubcategory(@Param('id') id: string) {
    return this.categorySubcategoryService.removeSubcategory(id);
  }
}
