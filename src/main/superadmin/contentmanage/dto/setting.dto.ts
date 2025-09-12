import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { LanguageType } from '@prisma/client';
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
  @IsString()
  link: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: true,
  })
  file?: any;
}
