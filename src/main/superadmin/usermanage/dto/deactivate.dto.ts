import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class DeactivateDto {
  @ApiProperty({
    description: 'Set false to deactivate the user, true to activate again',
    example: false,
  })
  @IsBoolean()
  isActive: boolean;
}
