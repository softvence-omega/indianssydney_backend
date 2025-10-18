import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  UploadedFile,
  UseInterceptors,
  Delete,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterService, FileType } from 'src/lib/multer/multer.service';
import { GetUser, ValidateAuth, ValidateSuperAdmin } from 'src/common/jwt/jwt.decorator';

import { SettingsService } from '../service/settings.service';
import {
  CreateAdsDto,
  CreateFaqDto,
  CreateFaqSectionWithFaqsDto,
  CreateLanguageDto,
  CreatePrivacyPolicyDto,
  CreateTermsConditionsDto,
  UpdateFaqSectionDto,
  UpdatePrivacyPolicyDto,
  UpdateTermsConditionsDto,
} from '../dto/setting.dto';
import uploadFileToS3 from 'src/lib/utils/uploadImageAWS';
import { promises as fs } from 'fs';
import { AppError } from 'src/common/error/handle-error.app';
import { get, patch } from 'axios';

@ApiTags('Super Admin Settings')
@ApiBearerAuth()
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // -------------------- Privacy Policy --------------------
  @Post('privacy-policy')
  @ValidateSuperAdmin()
  @ApiOperation({ summary: 'Create Privacy Policy' })
  createPrivacyPolicy(@Body() dto: CreatePrivacyPolicyDto) {
    return this.settingsService.createPrivacyPolicy(dto);
  }

  @Patch('privacy-policy/:id')
  @ValidateSuperAdmin()
  @ApiOperation({ summary: 'Update Privacy Policy' })
  updatePrivacyPolicy(
    @Param('id') id: string,
    @Body() dto: UpdatePrivacyPolicyDto,
  ) {
    return this.settingsService.updatePrivacyPolicy(id, dto);
  }

  @Get('privacy-policy')
  @ApiOperation({ summary: 'Get all Privacy Policies' })
  getPrivacyPolicies() {
    return this.settingsService.getPrivacyPolicies();
  }

  @Patch('privacy-policy/:id')
  @ValidateSuperAdmin()
  @ApiOperation({ summary: 'Update Privacy Policy by ID' })
  updatePrivacyPolicyById(
    @Param('id') id: string,
    @Body() dto: UpdatePrivacyPolicyDto,
  ) {
    return this.settingsService.updatePrivacyPolicy(id, dto);
  }

  @Delete('privacy-policy/:id')
  @ValidateSuperAdmin()
  @ApiOperation({ summary: 'Delete Privacy Policy' })
  async deletePrivacyPolicy(@Param('id') id: string) {
    return this.settingsService.deletePrivacyPolicy(id);
  }
  // -------------------- Terms --------------------
  @Post('terms')
  @ValidateSuperAdmin()
  @ApiOperation({ summary: 'Create Terms & Conditions' })
  createTerms(@Body() dto: CreateTermsConditionsDto) {
    return this.settingsService.createTerms(dto);
  }

  @Patch('terms/:id')
  @ValidateSuperAdmin()
  @ApiOperation({ summary: 'Update Terms & Conditions' })
  updateTerms(@Param('id') id: string, @Body() dto: UpdateTermsConditionsDto) {
    return this.settingsService.updateTerms(id, dto);
  }

  @Get('terms')
  @ApiOperation({ summary: 'Get Terms & Conditions' })
  getTerms() {
    return this.settingsService.getTerms();
  }

  @Get('terms/:id')
  @ApiOperation({ summary: 'Get Terms & Conditions by ID' })
  async getTermsById(@Param('id') id: string) {
    return this.settingsService.getTermsById(id);
  }

  @Delete('terms/:id')
  @ValidateSuperAdmin()
  @ApiOperation({ summary: 'Delete Terms & Conditions' })
  async deleteTerms(@Param('id') id: string) {
    return this.settingsService.deleteTerms(id);
  }

  // -------------------- FAQ (transactional) --------------------
  @Post('faq-section-with-faqs')
  @ValidateSuperAdmin()
  @ApiOperation({
    summary: 'Create FAQ Section with multiple FAQs (transactional)',
  })
  createFaqSectionWithFaqs(@Body() dto: CreateFaqSectionWithFaqsDto) {
    return this.settingsService.createFaqSectionWithFaqs(dto);
  }

  @Get('faq')
  @ApiOperation({ summary: 'Get FAQs' })
  getFaqs() {
    return this.settingsService.getFaqs();
  }

  @Get('faq/:id')
  @ApiOperation({ summary: 'Get FAQ Section by ID' })
  getFaqSection(@Param('id') id: string) {
    return this.settingsService.getFaqSection(id);
  }
  // settings.controller.ts
  @Patch('faq/:id')
  @ValidateSuperAdmin()
  @ApiOperation({ summary: 'Update FAQ Section by ID' })
  updateFaqSection(@Param('id') id: string, @Body() dto: UpdateFaqSectionDto) {
    return this.settingsService.updateFaqSection(id, dto);
  }

  @Delete('faq/:id')
  @ValidateSuperAdmin()
  @ApiOperation({ summary: 'Delete FAQ Section' })
  deleteFaqSection(@Param('id') id: string) {
    return this.settingsService.deleteFaqSection(id);
  }

  // -------------------- Language --------------------
  @Post('language')
  @ValidateSuperAdmin()
  @ApiOperation({ summary: 'Create Language' })
  createLanguage(@Body() dto: CreateLanguageDto) {
    return this.settingsService.createLanguage(dto);
  }

  @Get('language')
  @ApiOperation({ summary: 'Get Languages' })
  getLanguages() {
    return this.settingsService.getLanguages();
  }

  @Get('language/:id')
  @ApiOperation({ summary: 'Get Language by ID' })
  getLanguage(@Param('id') id: string) {
    return this.settingsService.getLanguage(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update language' })
  updateLanguage(@Param('id') id: string, @Body() dto: CreateLanguageDto) {
    return this.settingsService.updateLanguage(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete language' })
  deleteLanguage(@Param('id') id: string) {
    return this.settingsService.deleteLanguage(id);
  }
  // -------------------- Ads --------------------
  @ApiOperation({ summary: 'Create a new advertisement (Admin only)' })
  @ApiBearerAuth()
  @ValidateSuperAdmin()
  @Post('ads-create')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor(
      'file',
      new MulterService().createMulterOptions(
        './uploads',
        'content',
        FileType.ANY,
      ),
    ),
  )
  async createAds(
    @Body() dto: CreateAdsDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new AppError(400, 'Ad image is required');
    }

    // Upload file to S3
    const s3Result = await uploadFileToS3(file.path);

    // Delete local temp file
    try {
      await fs.unlink(file.path);
    } catch (err) {
      console.warn('⚠️ Failed to delete temp ad file:', err);
    }

    // Call service with DTO and S3 result
    return this.settingsService.createAds(dto, s3Result);
  }

  @Get('ads')
  @ApiOperation({ summary: 'Get Ads' })
  getAds() {
    return this.settingsService.getAds();
  }

  @Get('ads/:id')
  @ApiOperation({ summary: 'Get Ad by ID' })
  getAd(@Param('id') id: string) {
    return this.settingsService.getAd(id);
  }

  //----------- Update Ads------
  @Patch('ads/:id')
  @ValidateSuperAdmin()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor(
      'file', // Must match the form-data field
      new MulterService().createMulterOptions(
        './uploads',
        'content',
        FileType.ANY,
      ),
    ),
  )
  @ApiOperation({ summary: 'Update Ad by ID' })
  async updateAd(
    @Param('id') id: string,
    @Body() dto: CreateAdsDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      // Upload file to S3
      const s3Result = await uploadFileToS3(file.path);
      dto.file = file;
      dto['fileS3'] = s3Result.url;

      // Delete temporary local file
      try {
        await fs.unlink(file.path);
      } catch (err) {
        console.warn('⚠️ Failed to delete temp ad file:', err);
      }
    }

    return this.settingsService.updateAd(id, dto);
  }

  @Delete('ads/:id')
  @ValidateSuperAdmin()
  @ApiOperation({ summary: 'Delete Ad' })
  deleteAd(@Param('id') id: string) {
    return this.settingsService.deleteAd(id);
  }

  
}
