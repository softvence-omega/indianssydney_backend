import { ApiProperty } from '@nestjs/swagger';
import { ApplyStatus, Status } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class ContentStatusChangeDto {
  @ApiProperty({
    description: 'Set the content status',
    enum: Status,
    example: Status.APPROVE,
  })
  @IsEnum(Status)
  status: Status;
}

export class ContributorApplyStatusDto {
  @ApiProperty({
    description: 'Set the application status',
    enum: ApplyStatus,
    example: ApplyStatus.APPROVED,
  })
  @IsEnum(ApplyStatus, {
    message: 'Status must be one of the defined enum values',
  })
  status: ApplyStatus;
}
