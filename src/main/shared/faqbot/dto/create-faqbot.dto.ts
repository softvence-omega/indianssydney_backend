import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateFaqbotDto {
  @ApiProperty({ example: 'How to log into this site?' })
  @IsString()
  @IsNotEmpty()
  user_message: string;
}
