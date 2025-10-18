import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import {
  successResponse,
  TResponse,
} from 'src/common/utilsResponse/response.util';
import { HandleError } from 'src/common/error/handle-error.decorator';
import {
  CreateAdsDto,
  CreateFaqDto,
  CreateFaqSectionWithFaqsDto,
  CreateLanguageDto,
  CreatePrivacyPolicyDto,
  CreateTermsConditionsDto,
  UpdateAdsDto,
  UpdateFaqSectionDto,
  UpdatePrivacyPolicyDto,
  UpdateTermsConditionsDto,
} from '../dto/setting.dto';
import { AppError } from 'src/common/error/handle-error.app';
import { FileService } from 'src/lib/file/file.service';
import uploadFileToS3 from 'src/lib/utils/uploadImageAWS';

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
    const data = await this.prisma.privacyPolicy.findUnique({
      where: { id },
    });
    return successResponse(data, 'Terms & Conditions fetched successfully');
  }

  @HandleError('Failed to delete privacy policy', 'PrivacyPolicy')
  async deletePrivacyPolicy(id: string) {
    const data = await this.prisma.privacyPolicy.delete({ where: { id } });
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

  @HandleError('Failed to get FAQ section', 'FAQ')
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

  @HandleError('Failed to update FAQ section', 'FAQ')
  async updateFaqSection(id: string, dto: UpdateFaqSectionDto) {
    const data = await this.prisma.faqSection.update({
      where: { id },
      data: {
        sectionTitle: dto.sectionTitle,
        faqs: dto.faqs
          ? {
              deleteMany: {},
              create: dto.faqs
                .filter((faq) => faq.question && faq.answer)
                .map((faq) => ({
                  question: faq.question!,
                  answer: faq.answer!,
                })),
            }
          : undefined,
      },
      include: { faqs: true },
    });

    return successResponse(data, 'FAQ Section updated successfully');
  }

  // -------------------- Language --------------------
  @HandleError('Failed to create language', 'Language')
  async createLanguage(payload: CreateLanguageDto) {
    const data = await this.prisma.language.create({ data: payload });
    return successResponse(data, 'Language created successfully');
  }

  @HandleError('Failed to get languages', 'Language')
  async getLanguages() {
    // increment each language by +1
    await this.prisma.language.updateMany({
      data: { languageuse: { increment: 1 } },
    });

    const data = await this.prisma.language.findMany({
      orderBy: { languageuse: 'asc' },
    });

    return successResponse(data, 'Languages fetched successfully');
  }

  @HandleError('Failed to get language', 'Language')
  async updateLanguage(id: string, dto: CreateLanguageDto) {
    return this.prisma.language.update({
      where: { id },
      data: { language: dto.language },
    });
  }

  @HandleError('Failed to get language', 'Language')
  async deleteLanguage(id: string) {
    return this.prisma.language.delete({ where: { id } });
  }

  @HandleError('Failed to get language', 'Language')
  async getLanguage(id: string) {
    const lang = await this.prisma.language.findUnique({ where: { id } });
    if (!lang) throw new NotFoundException('Language not found');
    return lang;
  }

  // --------------------------------- Ads --------------------------------------
  @HandleError('Failed to create ad', 'Ads')
  async createAds(dto: CreateAdsDto, s3Result: { url: string; key: string }) {
    if (!s3Result?.url) {
      throw new AppError(400, 'Ad image upload failed');
    }

    const ad = await this.prisma.ads.create({
      data: {
        title: dto.title,
        subtitle: dto.subtitle,
        link: dto.link,
        adsposition: dto.adsposition,
        adsimage: s3Result.url, // use S3 URL here
      },
    });

    return successResponse(ad, 'Ad created successfully');
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
  async updateAd(id: string, payload: UpdateAdsDto & { fileS3?: string }) {
    const data = await this.prisma.ads.update({
      where: { id },
      data: {
        ...(payload.title && { title: payload.title }),
        ...(payload.link && { link: payload.link }),
        ...(payload.subtitle && { subtitle: payload.subtitle }),
        ...(payload.adsposition && { adsposition: payload.adsposition }),
        ...(payload.fileS3 && { adsimage: payload.fileS3 }),
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
