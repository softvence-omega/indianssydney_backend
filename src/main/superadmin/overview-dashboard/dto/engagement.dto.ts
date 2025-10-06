import { IsOptional, IsIn } from 'class-validator';

export class EngagementQueryDto {
  @IsOptional()
  @IsIn(['week', 'month', 'quarter', 'all'])
  period?: string = 'all';
}
