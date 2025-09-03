import { ApiProperty } from '@nestjs/swagger';
import { BillingCycle } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsNumber, IsArray, ArrayMinSize, IsString } from 'class-validator';

export class PaymentPlanDto {
  @ApiProperty({ description: 'Plan name', example: 'Pro Plan' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Plan price', example: 29.99 })
@IsNotEmpty()
@IsNumber()
price: number;
 

  @ApiProperty({ description: 'Billing cycle', enum: BillingCycle, example: BillingCycle.MONTHLY })
  @IsEnum(BillingCycle)
  billingCycle: BillingCycle;

  @ApiProperty({ description: 'Short description', example: 'Ideal for small teams', required: false })
  @IsOptional()
  @IsString()
  shortBio?: string;

  @ApiProperty({
    description: 'Plan features',
    type: [String],
    example: ['Feature 1', 'Feature 2'],
    isArray: true,
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one feature is required' })
  @IsString({ each: true })
  features: string[];
}
