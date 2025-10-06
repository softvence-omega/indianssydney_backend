import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ReportStatus } from '@prisma/client';

export class UpdateReportStatusDto {
  @ApiProperty({
    description: 'The new status of the report',
    enum: ReportStatus,
    example: ReportStatus.REVIEWED,
  })
  @IsEnum(ReportStatus, {
    message: 'Status must be one of: PENDING, REVIEWED, RESOLVED, REJECTED',
  })
  @IsNotEmpty()
  status: ReportStatus;
}
