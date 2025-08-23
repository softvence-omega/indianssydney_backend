import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { UtilsService } from 'src/lib/utils/utils.service';
import { MailService } from 'src/lib/mail/mail.service';
import { AppError } from 'src/common/error/handle-error.app';
import { successResponse, TResponse } from 'src/common/utils/response.util';

import { UserResponseDto } from 'src/common/dto/user-response.dto';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from '../dto/register.dto';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from '../dto/uer.dto';
import { LoginDto } from '../dto/login.dto';
import { VerifyOtpAuthDto } from '../dto/varify-otp.dto';
import { ResetPasswordAuthDto } from '../dto/reset-password';
import {
  ChangePasswordAuthDto,
  UpdatePasswordDto,
} from '../dto/chnage-password.dto';
import { HandleError } from 'src/common/error/handle-error.decorator';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService,
    private readonly mail: MailService,
    private readonly jwt: JwtService,
  ) {}

  // ---------- REGISTER (send email verification OTP) ----------
  // async register(dto: RegisterDto): Promise<TResponse<any>> {
  //   const { email, password, confirmPassword } = dto;

  //   if (password !== confirmPassword) throw new AppError(400, 'Passwords do not match');

  //   const existing = await this.prisma.user.findUnique({ where: { email } });
  //   if (existing) throw new AppError(400, 'User already exists with this email');

  //   const { otp, expiryTime } = this.utils.generateOtpAndExpiry();

  //   const user = await this.prisma.user.create({
  //     data: {
  //       email,
  //       password: await this.utils.hash(password),
  //       isVerified: false,
  //       emailOtp: otp,
  //       otpExpiry: expiryTime,
  //     },
  //   });

  //   await this.mail.sendEmail(
  //     email,
  //     'Verify Your Email',
  //     `
  //       <h3>Hi,</h3>
  //       <p>Use the OTP below to verify your email:</p>
  //       <h2>${otp}</h2>
  //       <p>This OTP will expire in 10 minutes.</p>
  //     `,
  //   );

  //   return successResponse(
  //     { email: user.email },
  //     'Registered successfully. Check your email for the verification OTP.',
  //   );
  // }

  async register(payload: RegisterDto) {
    const { email, password, confirmPassword } = payload;

    // Check if passwords match
    if (password !== confirmPassword) {
      throw new AppError(400, 'Passwords do not match');
    }

    // Check if user already exists
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError(400, 'User already exists with this email');
    }

    // Hash the password
    const hashedPassword = await this.utils.hash(password);

    // Create new user
    const newUser = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        isVerified: false,
      },
    });

    // Generate OTP
    const { otp, expiryTime } = this.utils.generateOtpAndExpiry();

    // Store OTP and expiry in user record
    await this.prisma.user.update({
      where: { id: newUser.id },
      data: {
        emailOtp: otp,
        otpExpiry: expiryTime,
      },
    });

    // Send OTP email
    await this.mail.sendEmail(
      email,
      'Verify Your Email',
      `
      <h3>Hi,</h3>
      <p>Use the OTP below to verify your email:</p>
      <h2>${otp}</h2>
      <p>This OTP will expire in 10 minutes.</p>
    `,
    );

    // Generate JWT token for verification
    const jwtPayload = { id: newUser.id };
    const resetToken = await this.jwt.signAsync(jwtPayload, {
      expiresIn: '10m',
    });

    return { resetToken };
  }

  // ---------- VERIFY EMAIL (match OTP) ----------
  // async verifyEmail(dto: VerifyEmailDto): Promise<TResponse<any>> {

  //   const { email, otp } = dto;

  //   const user = await this.prisma.user.findUnique({ where: { email } });
  //   if (!user) throw new AppError(404, 'User not found');
  //   if (user.isVerified) return successResponse({}, 'Email already verified');

  //   if (!user.emailOtp || !user.otpExpiry) throw new AppError(400, 'No OTP found. Please register again.');
  //   if (user.emailOtp !== otp) throw new AppError(400, 'Invalid OTP');
  //   if (new Date() > user.otpExpiry) throw new AppError(400, 'OTP has expired');

  //   await this.prisma.user.update({
  //     where: { id: user.id },
  //     data: { isVerified: true, emailOtp: null, otpExpiry: null },
  //   });

  //   await this.mail.sendEmail(
  //     email,
  //     'Email Verified',
  //     `<h3>Hi,</h3><p>Your email has been verified successfully.</p>`,
  //   );

  //   return successResponse({}, 'Email verified successfully');

  // }

  // ---------- LOGIN (require verified) ----------
  async login(dto: LoginDto): Promise<TResponse<any>> {
    const { email, password } = dto;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError(404, 'User not found');

    if (!user.isVerified)
      throw new AppError(400, 'Please verify your email first');

    if (!user.password)
      throw new AppError(400, 'No password set for this account');

    const isMatch = await this.utils.compare(password, user.password);
    if (!isMatch) throw new AppError(400, 'Invalid credentials');

    const token = this.utils.generateToken({
      sub: user.id,
      email: user.email,
      roles: user.role as any,
    });

    const safeUser = this.utils.sanitizedResponse(UserResponseDto, user);

    return successResponse({ token, user: safeUser }, 'Login successful');
  }

  //  ------------------forgot passowrd--------------

  async forgetPassword(payload: ForgotPasswordDto) {
    const { email } = payload;

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User does not exist!');
    }

    // Generate OTP
    const { otp, expiryTime } = this.utils.generateOtpAndExpiry();

    // Store OTP and expiry in user record
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailOtp: otp, // Make sure your column is named emailOtp
        otpExpiry: expiryTime,
      },
    });

    // Send OTP email
    await this.mail.sendEmail(
      email, // Use payload.email here
      'Verify Your Email',
      `
      <h3>Hi,</h3>
      <p>Use the OTP below to verify your email:</p>
      <h2>${otp}</h2>
      <p>This OTP will expire in 10 minutes.</p>
    `,
    );

    // Generate JWT token for verification
    const jwtPayload = { id: user.id };
    const resetToken = await this.jwt.signAsync(jwtPayload, {
      expiresIn: '10m',
    });

    return { resetToken };
  }
  // --------varify otp--------------
  async verifyOtp(payload: VerifyOtpAuthDto) {
    // Verify the JWT token
    let decoded: any;
    try {
      decoded = await this.jwt.verifyAsync(payload.resetToken);
    } catch (err) {
      throw new ForbiddenException('Invalid or expired token!');
    }

    // Find user by ID from the token
    const user = await this.prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      throw new ForbiddenException('User not found!');
    }

    // Check OTP match
    if (user.emailOtp !== parseInt(payload.emailOtp)) {
      throw new ForbiddenException('OTP does not match!');
    }

    // Clear OTP and expiry
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailOtp: null,
        otpExpiry: null,
        isVerified: true, // Optional: mark user as verified
      },
    });

    // Generate a new JWT token
    const jwtPayload = { id: user.id };
    const resetToken = await this.jwt.signAsync(jwtPayload, {
      expiresIn: '10m',
    });

    return { resetToken };
  }
  // -------------------
  // -----Reset password using a valid reset token--------------
  async resetPassword(payload: ResetPasswordAuthDto) {
    // Verify token
    let decoded: any;
    try {
      decoded = await this.jwt.verifyAsync(payload.resetToken);
    } catch (err) {
      throw new ForbiddenException('Invalid or expired token!');
    }

    // Find user by ID
    const user = await this.prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    // Hash new password
    const hashedPassword = await this.utils.hash(payload.password);

    // Update user password
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return { message: 'Password reset successfully' };
  }

  //------------- Change password when user is logged in----------------------------
  async changePassword(userId: string, payload: ChangePasswordAuthDto) {
    try {
      // Fetch current user data
      const userData = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!userData) {
        throw new NotFoundException('User not found!');
      }

      // Ensure user has a password set
      if (!userData.password) {
        throw new ForbiddenException('User has no password set');
      }

      // Verify old password
      const matched = await this.utils.compare(
        payload.oldPassword,
        userData.password,
      );
      if (!matched) {
        throw new ForbiddenException('Old password does not match!');
      }

      // Hash new password
      const hashedPassword = await this.utils.hash(payload.newpassword);

      // Update password
      await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      return { message: 'Password changed successfully' };
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }
  // ---------------update password---------------
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

  // async verifyOtp(payload: VerifyEmailDto) {
  //   const isVerified = await this.jwt.verifyAsync(payload.resetToken);

  //   if (!isVerified) {
  //     throw new ForbiddenException('Invalid token!');
  //   }

  //   const decode = await this.jwt.decode(payload.resetToken);
  //   const user = await this.prisma.user.findUnique({
  //     where: {
  //       id: decode.id,
  //     },
  //   });

  //   if (!user) {
  //     throw new ForbiddenException('Something went wrong, try again!');
  //   }

  //   if (user.otp !== payload.otp) {
  //     throw new ForbiddenException('OTP not matched!');
  //   }

  //   await this.prisma.user.update({
  //     where: { id: user.id },
  //     data: {
  //       otp: null,
  //     },
  //   });

  //   const jwtPayload = {
  //     id: user.id,
  //   };

  //   // generate token
  //   const resetToken = await this.jwt.signAsync(jwtPayload, {
  //     expiresIn: this.Config.getOrThrow('RESET_TOKEN_EXPIRES_IN'),
  //   });

  //   return {
  //     resetToken,
  //   };
  // }
}
