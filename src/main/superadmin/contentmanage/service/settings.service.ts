import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { successResponse, TResponse } from 'src/common/utils/response.util';
import { HandleError } from 'src/common/error/handle-error.decorator';
import {
  CreateAdsDto,
  CreateFaqSectionWithFaqsDto,
  CreateLanguageDto,
  CreatePrivacyPolicyDto,
  CreateTermsConditionsDto,
  UpdatePrivacyPolicyDto,
  UpdateTermsConditionsDto,
} from '../dto/setting.dto';
import { AppError } from 'src/common/error/handle-error.app';
import { FileService } from 'src/lib/file/file.service';

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
  ) {}

  // -------------------- Privacy Policy --------------------
  @HandleError('Failed to create privacy policy', 'PrivacyPolicy')
  async createPrivacyPolicy(
    payload: CreatePrivacyPolicyDto,
  ): Promise<TResponse<any>> {
    const data = await this.prisma.privacyPolicy.create({ data: payload });
    return successResponse(data, 'Privacy Policy created successfully');
  }

  @HandleError('Failed to update privacy policy', 'PrivacyPolicy')
  async updatePrivacyPolicy(
    id: string,
    payload: UpdatePrivacyPolicyDto,
  ): Promise<TResponse<any>> {
    const data = await this.prisma.privacyPolicy.update({
      where: { id },
      data: payload,
    });
    return successResponse(data, 'Privacy Policy updated successfully');
  }

  @HandleError('Failed to get privacy policies', 'PrivacyPolicy')
  async getPrivacyPolicies(): Promise<TResponse<any>> {
    const data = await this.prisma.privacyPolicy.findMany();
    return successResponse(data, 'Privacy Policies fetched successfully');
  }

  // -------------------- Terms & Conditions --------------------
  async createTerms(payload: CreateTermsConditionsDto) {
    const data = await this.prisma.termsConditions.create({ data: payload });
    return successResponse(data, 'Terms & Conditions created successfully');
  }

  async updateTerms(id: string, payload: UpdateTermsConditionsDto) {
    const data = await this.prisma.termsConditions.update({
      where: { id },
      data: payload,
    });
    return successResponse(data, 'Terms & Conditions updated successfully');
  }

  async getTerms() {
    const data = await this.prisma.termsConditions.findMany();
    return successResponse(data, 'Terms & Conditions fetched successfully');
  }

  // -------------------- FAQ (transactional) --------------------
  async createFaqSectionWithFaqs(payload: CreateFaqSectionWithFaqsDto) {
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Create section
      const section = await tx.faqSection.create({
        data: { sectionTitle: payload.sectionTitle },
      });

      // 2. Create FAQs under section
      const faqs = await tx.faq.createMany({
        data: payload.faqs.map((faq) => ({
          question: faq.question,
          answer: faq.answer,
          sectionId: section.id,
        })),
      });

      return { section, faqs };
    });

    return successResponse(
      result,
      'FAQ Section with FAQs created successfully',
    );
  }

  async getFaqs() {
    const data = await this.prisma.faqSection.findMany({
      include: { faqs: true },
    });
    return successResponse(data, 'FAQs fetched successfully');
  }

  // -------------------- Language --------------------
  async createLanguage(payload: CreateLanguageDto) {
    const data = await this.prisma.language.create({ data: payload });
    return successResponse(data, 'Language created successfully');
  }

  async getLanguages() {
    const data = await this.prisma.language.findMany();
    return successResponse(data, 'Languages fetched successfully');
  }

  // -------------------- Ads --------------------
  @HandleError('Failed to create ad', 'Ads')
  async createAds(payload: CreateAdsDto) {
    if (!payload.file) {
      throw new Error('Recommendation image is required');
    }

    // Process uploaded file (returns { url: string })
    const fileInstance = await this.fileService.processUploadedFile(
      payload.file,
    );

    const data = await this.prisma.ads.create({
      data: {
        title: payload.title,
        link: payload.link,
        adsimage: fileInstance.url,
      },
    });

    return successResponse(data, 'Ad created successfully');
  }

  async getAds() {
    const data = await this.prisma.ads.findMany();
    return successResponse(data, 'Ads fetched successfully');
  }
}
