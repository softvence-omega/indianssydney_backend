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

  @HandleError('Failed to get terms by id', 'Terms')
  async getTermsById(id: string) {
    const data = await this.prisma.termsConditions.findUnique({
      where: { id },
    });
    return successResponse(data, 'Terms & Conditions fetched successfully');
  }

  @HandleError('Failed to delete privacy policy', 'PrivacyPolicy')
  async deletePrivacyPolicy(id: string) {
    const data = await this.prisma.termsConditions.delete({ where: { id } });
    return successResponse(data, 'Terms & Conditions deleted successfully');
  }

  // -------------------- ----------------Terms & Conditions --------------------------------------------------------
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

  async deleteTerms(id: string) {
    const data = await this.prisma.termsConditions.delete({ where: { id } });
    return successResponse(data, 'Terms & Conditions deleted successfully');
  }

  // -------------------- FAQ (transactional) --------------------
  @HandleError('Failed to create FAQ section with FAQs', 'FAQ')
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

  @HandleError('Failed to get FAQs', 'FAQ')
  async getFaqs() {
    const data = await this.prisma.faqSection.findMany({
      include: { faqs: true },
    });
    return successResponse(data, 'FAQs fetched successfully');
  }

  async getFaqSection(id: string) {
    const data = await this.prisma.faqSection.findUnique({
      where: { id },
      include: { faqs: true },
    });
    return successResponse(data, 'FAQ Section fetched successfully');
  }

  async deleteFaqSection(id: string) {
    const data = await this.prisma.faqSection.delete({ where: { id } });
    return successResponse(data, 'FAQ Section deleted successfully');
  }

  // -------------------- Language --------------------
  @HandleError('Failed to create language', 'Language')
  async createLanguage(payload: CreateLanguageDto) {
    const data = await this.prisma.language.create({ data: payload });
    return successResponse(data, 'Language created successfully');
  }

  @HandleError('Failed to get languages', 'Language')
  async getLanguages() {
    const data = await this.prisma.language.findMany();
    return successResponse(data, 'Languages fetched successfully');
  }

  // --------------------------------- Ads --------------------------------------
  @HandleError('Failed to create ad', 'Ads')
  async createAds(payload: CreateAdsDto) {
    if (!payload.file) {
      throw new AppError(400, 'Recommendation image is required');
    }

    let fileInstance: any;
    if (payload.file) {
      fileInstance = await this.fileService.processUploadedFile(payload.file);
    }

    const data = await this.prisma.ads.create({
      data: {
        title: payload.title,
        link: payload.link,
        adsimage: fileInstance.url,
      },
    });

    return successResponse(data, 'Ad created successfully');
  }
  

  @HandleError('Failed to get ads', 'Ads')
  async getAds() {
    const data = await this.prisma.ads.findMany();
    return successResponse(data, 'Ads fetched successfully');
  }

  @HandleError('Failed to get ad', 'Ads')
  async getAd(id: string) {
    const data = await this.prisma.ads.findUnique({ where: { id } });
    return successResponse(data, 'Ad fetched successfully');
  }

  @HandleError('Failed to update ad', 'Ads')
  async updateAd(id: string, payload: CreateAdsDto) {
    let fileInstance: any;
    if (payload.file) {
      fileInstance = await this.fileService.processUploadedFile(payload.file);
    }

    const data = await this.prisma.ads.update({
      where: { id },
      data: {
        title: payload.title,
        link: payload.link,
        ...(fileInstance && { adsimage: fileInstance.url }),
      },
    });

    return successResponse(data, 'Ad updated successfully');
  }

  @HandleError('Failed to delete ad', 'Ads')
  async deleteAd(id: string) {
    const data = await this.prisma.ads.delete({ where: { id } });
    return successResponse(data, 'Ad deleted successfully');
  }
}
