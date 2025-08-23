import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'john@gmail.com',
    description: 'Valid email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '12345678',
    description: 'Password (min 6 characters)',
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: '12345678',
    description: 'Confirm password (checked in service)',
  })
  @IsNotEmpty()
  confirmPassword: string;

}
