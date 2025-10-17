import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { firstValueFrom } from 'rxjs';
import {
  CreateAiCategoryDto,
  CreateAiParagraphDto,
} from '../dto/create-aicontent.dto';
import { HandleError } from 'src/common/error/handle-error.decorator';

@Injectable()
export class AicontentService {
  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  // ---------- AI Paragraph Generation ----------
  @HandleError('Failed to generate AI paragraph', 'AI paragraph generation')
  async paragraphCreate(dto: CreateAiParagraphDto) {
    const apiUrl = 'https://ai.australiancanvas.com/files/content-generation';

    try {
      const response = await firstValueFrom(
        this.httpService.post(apiUrl, { paragraph: dto.paragraph }),
      );

      const aiResponse = response.data.generated_content;

      const saved = await this.prisma.aiParagraphGeneration.create({
        data: {
          paragraph: dto.paragraph,
          originalParagraph: dto.paragraph,
          generatedContent: aiResponse,
          wordCount: response.data.word_count,
          success: response.data.success,
          errorMessage: response.data.error_message,
          rawResponse: response.data,
        },
      });

      // Simplified response
      return {
        success: true,
        paragraph: saved.paragraph,
        generatedContent: saved.generatedContent,
        wordCount: saved.wordCount,
      };
    } catch (error) {
      return {
        success: false,
        paragraph: dto.paragraph,
        generatedContent: '',
        errorMessage: error.message,
      };
    }
  }

  @HandleError('Failed to generate SEO tags', 'SEO tag generation')
  async seoTagCreate(dto: CreateAiCategoryDto) {
    const apiUrl = 'https://ai.australiancanvas.com/files/seo-tags';

    try {
      // Send all optional data to AI API
      const { data: apiData } = await firstValueFrom(
        this.httpService.post(apiUrl, {
          category: dto.category,
          subcategory: dto.subcategory,
          title: dto.title || '',
          sub_title: dto.sub_title || '',
          content: dto.content || '',
        }),
      );

      const saved = await this.prisma.aiSeoTag.create({
        data: {
          category: dto.category,
          subcategory: dto.subcategory,
          title: dto.title || null,
          sub_title: dto.sub_title || null,
          content: dto.content || null,
          tags: apiData.tags || [],
          metaKeywords: apiData.meta_keywords || [],
          titleSuggestions: apiData.title_suggestions || [],
          metaDescription: apiData.meta_description || null,
          longTailKeywords: apiData.long_tail_keywords || [],
          hashtags: apiData.hashtags || [],
          contentKeywords: apiData.content_keywords || [],
          success: apiData.success ?? true,
          errorMessage: apiData.error_message || null,
          rawResponse: apiData,
        },
      });

      return {
        success: true,
        category: saved.category,
        subcategory: saved.subcategory,
        title: saved.title,
        sub_title: saved.sub_title,
        content: saved.content,
        tags: saved.tags,
        metaKeywords: saved.metaKeywords,
        titleSuggestions: saved.titleSuggestions,
        metaDescription: saved.metaDescription,
        longTailKeywords: saved.longTailKeywords,
        hashtags: saved.hashtags,
        contentKeywords: saved.contentKeywords,
      };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Unknown error';

      await this.prisma.aiSeoTag.create({
        data: {
          category: dto.category,
          subcategory: dto.subcategory,
          title: dto.title || null,
          sub_title: dto.sub_title || null,
          content: dto.content || null,
          success: false,
          errorMessage,
          rawResponse: error.response?.data || {},
        },
      });

      return {
        success: false,
        category: dto.category,
        subcategory: dto.subcategory,
        title: dto.title || null,
        sub_title: dto.sub_title || null,
        content: dto.content || null,
        tags: [],
        metaKeywords: [],
        titleSuggestions: [],
        longTailKeywords: [],
        hashtags: [],
        contentKeywords: [],
        errorMessage,
      };
    }
  }

  // ------get paragraph--------
  @HandleError('Failed to get paragraph', 'Get paragraph')
  async getAiParagraph() {
    const paragraph = await this.prisma.aiParagraphGeneration.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return paragraph;
  }

  // ------GET SEO TAG. ---------

  @HandleError('Failed to get SEO tags', 'Get SEO tags')
  async getSeoTags() {
    const seoTags = await this.prisma.aiSeoTag.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return seoTags;
  }
}
