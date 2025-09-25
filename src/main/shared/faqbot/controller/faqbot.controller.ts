import { Controller, Post, Get, Body, Patch, Param, Delete } from '@nestjs/common';

import { CreateFaqbotDto } from '../dto/create-faqbot.dto';
import { UpdateFaqbotDto } from '../dto/update-faqbot.dto';
import { FaqbotService } from '../services/faqbot.service';

@Controller('faqbot')
export class FaqbotController {
  constructor(private readonly faqbotService: FaqbotService) {}

  @Post()
  create(@Body() createFaqbotDto: CreateFaqbotDto) {
    return this.faqbotService.create(createFaqbotDto);
  }

  @Get()
  findAll() {
    return this.faqbotService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.faqbotService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFaqbotDto: UpdateFaqbotDto) {
    return this.faqbotService.update(id, updateFaqbotDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.faqbotService.remove(id);
  }
}
