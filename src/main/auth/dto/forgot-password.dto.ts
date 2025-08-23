import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ForgetPasswordAuthDto {
  @ApiProperty({ example: 'john.doe@gmail.com' })
  @IsString()
  email: string;
}