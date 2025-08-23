import { Injectable } from '@nestjs/common';
import { HandleError } from 'src/common/error/handle-error.decorator';
import { FileService } from 'src/lib/file/file.service';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { UtilsService } from 'src/lib/utils/utils.service';
import { UpdateProfileDto } from '../dto/update.profile.dto';
import { AppError } from 'src/common/error/handle-error.app';
import { successResponse, TResponse } from 'src/common/utils/response.util';
import { UpdatePasswordDto } from '../dto/updatepassword.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService,
    private readonly fileService: FileService,
  ) {}

  @HandleError('Failed to update profile', 'Profile')
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
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

  
 
  // ---------------update password---------------
  @HandleError('Failed to change update password', 'User')
  async updatePassword(
    userid: string,
    dto: UpdatePasswordDto,
  ): Promise<TResponse<any>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userid },
        select: { password: true, googleId: true },
      });

      if (!user) throw new AppError(404, 'User not found');

      // If user registered via Google only
      if (!user.password) {
        const hashedPassword = await this.utils.hash(dto.newPassword);
        await this.prisma.user.update({
          where: { id: userid },
          data: { password: hashedPassword },
        });
        return successResponse(null, 'Password set successfully');
      }

      // Require current password for normal users
      if (!dto.currentPassword)
        throw new AppError(400, 'Current password is required');

      const isPasswordValid = await this.utils.compare(
        dto.currentPassword,
        user.password,
      );
      if (!isPasswordValid) throw new AppError(400, 'Invalid current password');

      const hashedPassword = await this.utils.hash(dto.newPassword);
      await this.prisma.user.update({
        where: { id: userid },
        data: { password: hashedPassword },
      });

      return successResponse(null, 'Password updated successfully');
    } catch (err) {
      console.error('Error updating password:', err);
      throw err;
    }
  }

}
