import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from '../services/user.service';

import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileType, MulterService } from 'src/lib/multer/multer.service';
import { GetUser, ValidateAuth } from 'src/common/jwt/jwt.decorator';
import { UpdateProfileDto } from '../dto/update.profile.dto';
import { UpdatePasswordDto } from 'src/main/auth/dto/chnage-password.dto';

@Controller('user')
@ApiTags('User')
@ValidateAuth()
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch('me/update')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor(
      'file',
      new MulterService().createMulterOptions('./temp', 'temp', FileType.IMAGE),
    ),
  )
  async updateProfile(
    @GetUser('userId') userId: string,
    @Body() dto: UpdateProfileDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      dto.file = file;
    }
    return await this.userService.updateProfile(userId, dto);
  }

  // ---------update pass--
  @ApiOperation({ summary: 'Change & update user password' })
  @Post('me/update-password')
  async updatePassword(
    @GetUser('userId') userId: string,
    @Body() body: UpdatePasswordDto,
  ) {
    console.log('DEBUG: userId from JWT =', userId);
    if (!userId) {
      throw new BadRequestException('User ID not found in token');
    }

    return this.userService.updatePassword(userId, body);
  }
}
