import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { OtpRequestDto } from './dto/otp-request.dto';
import { OtpVerifyDto } from './dto/otp-verify.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { RequestWithUser } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return await this.authService.register(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('otp/request')
  async requestOtp(@Body() dto: OtpRequestDto) {
    return await this.authService.requestOtp(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('otp/verify')
  async verifyOtp(@Body() dto: OtpVerifyDto) {
    return await this.authService.verifyOtp(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@Req() req: RequestWithUser) {
    return await this.authService.getCurrentUser(req.user.id);
  }
}
