import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Patch,
  Delete,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateAustraliaLawDto } from '../dto/create-australia-law.dto';
import { UpdateAustraliaLawDto } from '../dto/update-australia-law.dto';
import { AustraliaLawService } from '../service/australia-law.service';
import { MulterService, FileType } from 'src/lib/multer/multer.service';

@ApiTags('AustraliaLaw')
@Controller('australia-law')
export class AustraliaLawController {
  constructor(private readonly australiaLawService: AustraliaLawService) {}

  @ApiOperation({ summary: 'Create Australia Law with multiple files' })
  @Post('create')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor(
      'files',
      5,
      new MulterService().createMulterOptions('./temp', 'temp', FileType.ANY),
    ),
  )
  async createAustraliaLaw(
    @Body() dto: CreateAustraliaLawDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    console.log('DTO:', dto);
    console.log(
      'Uploaded Files:',
      files?.map((f) => f.originalname),
    );

    if (!files?.length) throw new Error('No files uploaded');

    return this.australiaLawService.createAustraliaLaw(dto, files);
  }

  @Get()
  findAll() {
    return this.australiaLawService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.australiaLawService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAustraliaLawDto) {
    return this.australiaLawService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.australiaLawService.remove(id);
  }
}
