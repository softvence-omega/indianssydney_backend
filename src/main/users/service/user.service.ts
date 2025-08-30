import { Body, Injectable } from '@nestjs/common';
import { HandleError } from 'src/common/error/handle-error.decorator';

import { FileService } from 'src/lib/file/file.service';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { UtilsService } from 'src/lib/utils/utils.service';

import { UpdateProfileDto } from '../dto/update.profile.dto';
import { UpdatePasswordDto } from '../dto/updatepassword.dto';

import { AppError } from 'src/common/error/handle-error.app';
import { successResponse, TResponse } from 'src/common/utils/response.util';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService,
    private readonly fileService: FileService,
  ) {}

  // ------------------------- Update Password -----------------
  @HandleError('Failed to update password', 'User')
  async updatePassword(
    userid: string,
    dto: UpdatePasswordDto,
  ): Promise<TResponse<any>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userid },
      select: { password: true, googleId: true },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // If user registered via Google only (no password set yet)
    if (!user.password) {
      const hashedPassword = await this.utils.hash(dto.newPassword);

      await this.prisma.user.update({
        where: { id: userid },
        data: { password: hashedPassword },
      });

      return successResponse(null, 'Password set successfully');
    }

    // For normal email/password users — require current password check
    if (!dto.currentPassword) {
      throw new AppError(400, 'Current password is required');
    }

    const isPasswordValid = await this.utils.compare(
      dto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new AppError(400, 'Invalid current password');
    }

    const hashedPassword = await this.utils.hash(dto.newPassword);

    await this.prisma.user.update({
      where: { id: userid },
      data: { password: hashedPassword },
    });

    return successResponse(null, 'Password updated successfully');
  }

  // ------------------------- Update Profile -----------------
  @HandleError('Failed to update profile', 'Profile')
  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<TResponse<any>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new AppError(404, 'User not found');

    let fileInstance: any;
    if (dto.file) {
      fileInstance = await this.fileService.processUploadedFile(dto.file);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: dto.fullName?.trim() ? dto.fullName.trim() : user.fullName,
        profilePhoto: fileInstance?.url || user.profilePhoto,
        bio: dto.bio?.trim() ? dto.bio.trim() : user.bio,
      },
    });

    return successResponse(updatedUser, 'User Profile updated successfully');
  }

  // ------------------------- Get Profile -----------------
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        fullName: true,
        profilePhoto: true,
        bio: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) throw new AppError(404, 'User not found');

    return successResponse(user, 'User profile retrieved successfully');
  }
}
