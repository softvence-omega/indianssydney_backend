import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { AdsPostion, LanguageType } from '@prisma/client';
import { Type } from 'class-transformer';

// -------------------- Privacy Policy --------------------
export class CreatePrivacyPolicyDto {
  @ApiProperty({ example: 'Privacy Policy Title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'This is the privacy policy details.' })
  @IsString()
  subtext: string;
}

export class UpdatePrivacyPolicyDto {
  @ApiPropertyOptional({ example: 'Updated Privacy Policy Title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated subtext' })
  @IsOptional()
  @IsString()
  subtext?: string;
}

// -------------------- Terms & Conditions --------------------
export class CreateTermsConditionsDto {
  @ApiProperty({ example: 'Terms & Conditions Title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'These are the terms and conditions.' })
  @IsString()
  content: string;
}

export class UpdateTermsConditionsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string;
}

// -------------------------faq-------------------------------

export class CreateFaqDto {
  @ApiProperty({ example: 'What is your refund policy?' })
  @IsString()
  question: string;

  @ApiProperty({ example: 'You can request a refund within 14 days.' })
  @IsString()
  answer: string;
}

export class CreateFaqSectionWithFaqsDto {
  @ApiProperty({ example: 'General Questions' })
  @IsString()
  sectionTitle: string;

  @ApiProperty({
    type: [CreateFaqDto],
    example: [
      {
        question: 'What is your refund policy?',
        answer: 'You can request a refund within 14 days.',
      },
      {
        question: 'Do you offer support?',
        answer: 'Yes, 24/7 customer support is included.',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFaqDto)
  faqs: CreateFaqDto[];
}
// ----update faq--
// dto/update-faq.dto.ts

export class UpdateFaqDto extends PartialType(CreateFaqDto) {}

export class UpdateFaqSectionDto {
  @ApiProperty({ example: 'Updated Section Title', required: false })
  @IsOptional()
  @IsString()
  sectionTitle?: string;

  @ApiProperty({
    type: [UpdateFaqDto],
    required: false,
    example: [
      { question: 'Updated refund policy?', answer: 'Refunds within 30 days.' },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateFaqDto)
  faqs?: UpdateFaqDto[];
}

// -------------------- Language --------------------
export class CreateLanguageDto {
  @ApiProperty({ enum: LanguageType })
  @IsEnum(LanguageType)
  language: LanguageType;
}

// -------------------- Ads --------------------
export class CreateAdsDto {
  @ApiProperty({ example: 'Big Sale 50% Off' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'https://example.com' })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: true,
    description: 'Ads image file',
  })
  file: Express.Multer.File;

  @ApiProperty({ example: 'Get the best deals today' })
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiProperty({
    enum: AdsPostion,
    example: AdsPostion.FRONTPAGE,
    description: 'Where the ad will be displayed',
  })
  @IsOptional()
  @IsEnum(AdsPostion)
  adsposition?: AdsPostion;
}
export class UpdateAdsDto extends PartialType(CreateAdsDto) {}