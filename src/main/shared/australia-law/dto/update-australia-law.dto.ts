import { PartialType } from '@nestjs/swagger';
import { CreateAustraliaLawDto } from './create-australia-law.dto';

export class UpdateAustraliaLawDto extends PartialType(CreateAustraliaLawDto) {}
