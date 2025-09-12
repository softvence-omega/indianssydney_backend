import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterService, FileType } from 'src/lib/multer/multer.service';
import { ValidateSuperAdmin } from 'src/common/jwt/jwt.decorator';

import { SettingsService } from '../service/settings.service';
import {
  CreateAdsDto,
  CreateFaqDto,
  CreateFaqSectionWithFaqsDto,
  CreateLanguageDto,
  CreatePrivacyPolicyDto,
  CreateTermsConditionsDto,
  UpdatePrivacyPolicyDto,
  UpdateTermsConditionsDto,
} from '../dto/setting.dto';

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

  // -------------------- Ads --------------------
  @Post('ads')
  @ValidateSuperAdmin()
  @ApiOperation({ summary: 'Create Ads' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor(
      'file', // must match DTO field
      new MulterService().createMulterOptions(
        './temp',
        'recommendations',
        FileType.IMAGE,
      ),
    ),
  )
  async createAds(
    @Body() dto: CreateAdsDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) dto.file = file;
    return this.settingsService.createAds(dto);
  }

  @Get('ads')
  @ApiOperation({ summary: 'Get Ads' })
  getAds() {
    return this.settingsService.getAds();
  }
}
