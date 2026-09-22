import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { OtpVerifyDto } from './dto/otp-verify.dto';
import { OtpResendDto } from './dto/otp-resend.dto';
import { CreateUserDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    const data = await this.authService.create(dto);
    return this.response(data.message, data);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const data = await this.authService.login(dto);
    return this.response(data.message, data);
  }

  @HttpCode(HttpStatus.OK)
  @Post('verify-otp')
  async verifyOtp(@Body() dto: OtpVerifyDto) {
    const data = await this.authService.verifyOtp(dto);
    return this.response('OTP verified successfully.', data);
  }

  @HttpCode(HttpStatus.OK)
  @Post('resend-otp')
  async resendOtp(@Body() dto: OtpResendDto) {
    const data = await this.authService.resendOtp(dto);
    return this.response(data.message, data);
  }

  private response(message: string, data: unknown) {
    return { status: true, message, data };
  }
}
