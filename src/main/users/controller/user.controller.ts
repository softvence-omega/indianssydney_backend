import {
  Controller,
  Post,
  Body,
  Patch,
  UseInterceptors,
  UploadedFile,
  Get,
  UploadedFiles,
  Req,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FileType, MulterService } from 'src/lib/multer/multer.service';

import { UpdateProfileDto } from '../dto/update.profile.dto';

import {
  GetUser,
  ValidateAdmin,
  ValidateAuth,
} from 'src/common/jwt/jwt.decorator';
import { UpdatePasswordDto } from '../dto/updatepassword.dto';
import { UserService } from '../service/user.service';
import { CreateApplyFoContibutorDto } from '../dto/apply-contibutor.dto';
import { CreateReportDto } from '../dto/apply-Report.dto';
import uploadFileToS3 from 'src/lib/utils/uploadImageAWS';
@ApiTags('USER Profile Maintain')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  // ----------------------------- update profile  ----------------------
  // @ApiOperation({ summary: 'Update user profile' })
  // @ValidateAuth()
  // @ApiBearerAuth()
  // @Patch('me/update')
  // @ApiConsumes('multipart/form-data')
  // @UseInterceptors(
  //   FileInterceptor(
  //     'file',
  //     new MulterService().createMulterOptions('./temp', 'temp', FileType.IMAGE),
  //   ),
  // )
  // async updateProfile(
  //   @GetUser('userId') userId: string,
  //   @Body() dto: UpdateProfileDto,
  //   @UploadedFile() file?: Express.Multer.File,
  // ) {
  //   if (file) {
  //     dto.file = file;
  //   }
  //   console.log('the user id is', userId);
  //   return await this.userService.updateProfile(userId, dto);
  // }

  @ApiOperation({ summary: 'Update user profile' })
  @ValidateAuth()
  @ApiBearerAuth()
  @Patch('profile')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor(
      'file',
      new MulterService().createMulterOptions(
        './uploads',
        'content',
        FileType.ANY,
      ),
    ),
  )
  async updateProfile(
    @GetUser('userId') userId: string,
    @Body() dto: UpdateProfileDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    console.log('The user id is', userId);

    let s3Result: { url: string; key: string } | undefined;

    if (file) {
      // ✅ Upload to S3
      s3Result = await uploadFileToS3(file.path);
      console.log('✅ Uploaded to S3:', s3Result.url);

      // ✅ Remove local file after successful upload
      try {
        const fs = await import('fs/promises');
        await fs.unlink(file.path);
        console.log('🗑️ Local file deleted:', file.path);
      } catch (err) {
        console.warn('⚠️ Failed to delete local file:', err);
      }
    }

    // ✅ Pass s3Result to service
    return await this.userService.updateProfile(userId, dto, s3Result);
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
  // ------------------------ user apply for contibutor--================----------
  @ApiOperation({ summary: 'apply for contibutor' })
  @ValidateAuth()
  @ApiBearerAuth()
  @Post('apply-contributor')
  async applyForContributor(
    @GetUser('userId') userId: string,
    @Body() dto: CreateApplyFoContibutorDto,
  ) {
    return this.userService.applyForContributor(userId, dto);
  }

  // ---------------------user report Contents----------------
  @ApiOperation({ summary: 'Create Report with multiple screenshots' })
  @ApiBearerAuth()
  @ValidateAuth()
  @Post('create-report')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor(
      'files',
      5,
      new MulterService().createMulterOptions('./temp', 'temp', FileType.IMAGE),
    ),
  )
  async create(
    @Body() createReportDto: CreateReportDto,
    @UploadedFiles() files: Express.Multer.File[],
    @GetUser('userId') userId: string,
  ) {
    if (files && files.length) {
      createReportDto.files = files;
    }

    return this.userService.createReport(createReportDto, userId);
  }
}
