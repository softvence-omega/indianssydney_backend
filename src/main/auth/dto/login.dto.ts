import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: '68urgent@powerscrews.com',
    description: 'Valid email address here',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'new12345678',
    description: 'Password (min 6 characters)',
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;


}
