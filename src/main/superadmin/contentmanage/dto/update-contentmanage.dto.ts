import { PartialType } from '@nestjs/swagger';
import { CreateContentmanageDto } from './create-contentmanage.dto';

export class UpdateContentmanageDto extends PartialType(CreateContentmanageDto) {}
