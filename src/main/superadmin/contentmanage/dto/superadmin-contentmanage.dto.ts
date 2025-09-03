import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';
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
