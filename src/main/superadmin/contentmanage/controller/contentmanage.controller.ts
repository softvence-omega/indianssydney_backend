import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ContentmanageService } from '../service/contentmanage.service';
import { CreateContentmanageDto } from '../dto/create-contentmanage.dto';
import { UpdateContentmanageDto } from '../dto/update-contentmanage.dto';

@Controller('contentmanage')
export class ContentmanageController {
  constructor(private readonly contentmanageService: ContentmanageService) {}

  @Post()
  create(@Body() createContentmanageDto: CreateContentmanageDto) {
    return this.contentmanageService.create(createContentmanageDto);
  }

  @Get()
  findAll() {
    return this.contentmanageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contentmanageService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateContentmanageDto: UpdateContentmanageDto,
  ) {
    return this.contentmanageService.update(+id, updateContentmanageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contentmanageService.remove(+id);
  }
}
