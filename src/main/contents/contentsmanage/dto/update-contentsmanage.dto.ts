import { PartialType } from '@nestjs/swagger';
import { CreateContentsmanageDto } from './create-contentsmanage.dto';

export class UpdateContentsmanageDto extends PartialType(CreateContentsmanageDto) {}
