import { Expose } from 'class-transformer';
import { UserRole } from 'generated/prisma';

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  address?: string;

  @Expose()
  profilePhoto?: string;
  
  @Expose()
  fullName?: string;

  @Expose()
  role: UserRole;

  @Expose()
  isVerified: boolean;

  @Expose()
  isActive: boolean;

  @Expose()
  isDeleted: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  deletedAt?: Date;
}
