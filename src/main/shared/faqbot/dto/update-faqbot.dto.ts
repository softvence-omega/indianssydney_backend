import { PartialType } from '@nestjs/swagger';
import { CreateFaqbotDto } from './create-faqbot.dto';

export class UpdateFaqbotDto extends PartialType(CreateFaqbotDto) {}
