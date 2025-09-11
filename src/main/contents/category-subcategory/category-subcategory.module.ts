import { Module } from '@nestjs/common';
import { CategorySubcategoryService } from './service/category-subcategory.service';
import { CategorySubcategoryController } from './controller/category-subcategory.controller';

@Module({
  controllers: [CategorySubcategoryController],
  providers: [CategorySubcategoryService],
})
export class CategorySubcategoryModule {}
