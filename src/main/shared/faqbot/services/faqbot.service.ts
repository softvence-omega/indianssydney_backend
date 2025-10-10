import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import { CreateFaqbotDto } from '../dto/create-faqbot.dto';
import { UpdateFaqbotDto } from '../dto/update-faqbot.dto';
import { PrismaService } from 'src/lib/prisma/prisma.service';

@Injectable()
export class FaqbotService {
  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  async create(createFaqbotDto: CreateFaqbotDto) {
    const apiUrl = 'https://ai.australiancanvas.com/files/faq-chatbot';

    try {
      // Send the message to the external FAQ bot API
      const response = await firstValueFrom(
        this.httpService.post(apiUrl, {
          user_message: createFaqbotDto.user_message,
        }),
      );

      const botResponse = response.data.response;

      // Save conversation to DB
      await this.prisma.faqBot.create({
        data: {
          user_message: createFaqbotDto.user_message,
          response: botResponse,
        },
      });

      // Return clean response (matches your example)
      return {
        response: botResponse,
        success: true,
        error_message: null,
      };
    } catch (error) {
      // Save user message even if bot API fails
      await this.prisma.faqBot.create({
        data: { user_message: createFaqbotDto.user_message },
      });

      return {
        response: null,
        success: false,
        error_message: error.message,
      };
    }
  }

  async findAll() {
    return this.prisma.faqBot.findMany();
  }

  async findOne(id: string) {
    return this.prisma.faqBot.findUnique({ where: { id } });
  }

  async update(id: string, updateFaqbotDto: UpdateFaqbotDto) {
    return this.prisma.faqBot.update({
      where: { id },
      data: updateFaqbotDto,
    });
  }

  async remove(id: string) {
    return this.prisma.faqBot.delete({ where: { id } });
  }
}
