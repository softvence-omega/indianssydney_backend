import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AicontentService } from '../service/aicontent.service';
import { CreateAiCategoryDto, CreateAiParagraphDto } from '../dto/create-aicontent.dto';


@ApiTags('AI Content & SEO')
@Controller('aicontent')
export class AicontentController {
  constructor(private readonly service: AicontentService) {}

  // ---------- Paragraph ----------
  @Post('paragraph')
  @ApiOperation({ summary: 'Generate AI Paragraph document' })
  async createParagraph(@Body() dto: CreateAiParagraphDto) {
    return this.service.paragraphCreate(dto);
  }

  

  // ---------- SEO Tags ----------
  @Post('seo')
  @ApiOperation({ summary: 'Generate SEO Tags' })
  async createSeoTags(@Body() dto:CreateAiCategoryDto ) {
    return this.service.seoTagCreate(dto);
  }

  // GET AI 
  @Get('paragraph')
  @ApiOperation({ summary: 'Get AI all data here' })
  async getAiParagraph() {
    return this.service.getAiParagraph();
  }
  // -------get seotag------

  @Get('seo')
  @ApiOperation({ summary: 'Get SEO all data here generate' })
  async getSeoTags() {
    return this.service.getSeoTags();
  }
  
}
