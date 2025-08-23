import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GoogleLoginDto } from '../dto/google-login.dto';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { AuthService } from '../services/auth.service';
import { AuthGoogleService } from '../services/auth-google.service';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from '../dto/uer.dto';
import { VerifyOtpAuthDto } from '../dto/varify-otp.dto';
import {
  ChangePasswordAuthDto,
  UpdatePasswordDto,
} from '../dto/chnage-password.dto';
import { GetUser, ValidateUser } from 'src/common/jwt/jwt.decorator';
import { ForgetPasswordAuthDto } from '../dto/forgot-password.dto';
import { ResetPasswordAuthDto } from '../dto/reset-password';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authGoogleService: AuthGoogleService,
  ) {}

  @ApiOperation({ summary: 'User Registration with Email' })
  @Post('register')
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @ApiOperation({ summary: 'User Login with Email' })
  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @ApiOperation({ summary: 'Google Login or Sign Up' })
  @Post('google-login')
  async googleLogin(@Body() body: GoogleLoginDto) {
    return this.authGoogleService.googleLogin(body);
  }

  // @Post('verify-email')
  // verifyEmail(@Body() dto: VerifyEmailDto) {
  //   return this.authService.verifyEmail(dto);
  // }

  @Post('verify-otp')
  async verifyOtp(@Body() payload: VerifyOtpAuthDto) {
    const result = await this.authService.verifyOtp(payload);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'OTP verified successfully!',
      data: result,
    };
  }

  @Post('forget-password')
  async forgetPassword(@Body() payload: ForgetPasswordAuthDto) {
    console.log({ payload });
    const result = await this.authService.forgetPassword(payload);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Email sent successfully!',
      data: result,
    };
  }

  @ApiBearerAuth()
  @ValidateUser()
  @Post('change-password')
  async changePassword(
    @GetUser('userId') userId: string,
    @Body() payload: ChangePasswordAuthDto,
  ) {
    const result = await this.authService.changePassword(userId, payload);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Password updated successfully!',
      data: result,
    };
  }

  @Post('reset-password')
  async resetPassword(@Body() payload: ResetPasswordAuthDto) {
    const result = await this.authService.resetPassword(payload);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Password reset successfully!',
      data: result,
    };
  }

  @ApiOperation({ summary: 'Update user password' })
  @Post('me/update-password')
  async getProfile(
    @GetUser('userId') userId: string,
    @Body() body: UpdatePasswordDto,
  ) {
    return this.authService.updatePassword(userId, body);
  }
}
