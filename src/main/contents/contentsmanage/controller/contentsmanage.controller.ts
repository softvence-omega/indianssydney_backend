import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ContentsmanageService } from '../service/contentsmanage.service';
import { CreateContentsmanageDto } from '../dto/create-contentsmanage.dto';
import { UpdateContentsmanageDto } from '../dto/update-contentsmanage.dto';

@Controller('contentsmanage')
export class ContentsmanageController {
  constructor(private readonly contentsmanageService: ContentsmanageService) {}

  @Post()
  create(@Body() createContentsmanageDto: CreateContentsmanageDto) {
    return this.contentsmanageService.create(createContentsmanageDto);
  }

  @Get()
  findAll() {
    return this.contentsmanageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contentsmanageService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateContentsmanageDto: UpdateContentsmanageDto,
  ) {
    return this.contentsmanageService.update(+id, updateContentsmanageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contentsmanageService.remove(+id);
  }
}
