import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum UserRoleEnum {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
  MEMBER = 'MEMBER',
}

export class ChangeRoleDto {
  @ApiProperty({
    description: 'New role for the user',
    enum: UserRoleEnum,
    example: UserRoleEnum.ADMIN,
  })
  @IsEnum(UserRoleEnum)
  role: UserRoleEnum;
}
