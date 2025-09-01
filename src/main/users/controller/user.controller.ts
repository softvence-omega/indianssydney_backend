import {
  Controller,
  Post,
  Body,
  Patch,
  UseInterceptors,
  UploadedFile,
  Get,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileType, MulterService } from 'src/lib/multer/multer.service';

import { UpdateProfileDto } from '../dto/update.profile.dto';

import {
  GetUser,
  ValidateAdmin,
  ValidateAuth,
} from 'src/common/jwt/jwt.decorator';
import { UpdatePasswordDto } from '../dto/updatepassword.dto';
import { UserService } from '../service/user.service';
@ApiTags('USER Profile Maintain')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  // ----------------------update profile----------------------
  @ApiOperation({ summary: 'Update user profile' })
  @ValidateAuth()
  @ApiBearerAuth()
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
  // ----------------update password--------------------
  @ApiOperation({ summary: 'Update user password' })
  @ValidateAuth()
  @ApiBearerAuth()
  @Post('me/update-password')
  async getProfile(
    @GetUser('userId') userId: string,
    @Body() body: UpdatePasswordDto,
  ) {
    console.log('use id', userId);
    return this.userService.updatePassword(userId, body);
  }
  // ----------------get profile--------------------

  @ApiOperation({ summary: 'Get user there owner  data ' })
  @ValidateAuth()
  @ApiBearerAuth()
  @Get('me/profile')
  async getUserData(@GetUser('userId') userId: string) {
    return this.userService.getProfile(userId);
  }
  // ------------get all user for admin------------
  @ApiOperation({ summary: 'Get all users only admin or super admin access' })
  @ValidateAdmin()
  @ApiBearerAuth()
  @Get('all')
  async getAllUsers() {
    return this.userService.getAllUsers();
  }
}
