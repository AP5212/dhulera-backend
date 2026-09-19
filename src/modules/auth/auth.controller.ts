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
import { CreateUserDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { RequestWithUser } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    const data = await this.authService.create(dto);
    return this.response('User created successfully.', this.authService.sanitizeUser(data));
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const data = await this.authService.login(dto);
    return this.response('Login successful.', data);
  }

  // @HttpCode(HttpStatus.OK)
  // @Post('otp/request')
  // async requestOtp(@Body() dto: OtpRequestDto) {
  //   return await this.authService.requestOtp(dto);
  // }

  // @HttpCode(HttpStatus.OK)
  // @Post('otp/verify')
  // async verifyOtp(@Body() dto: OtpVerifyDto) {
  //   return await this.authService.verifyOtp(dto);
  // }

  // @UseGuards(JwtAuthGuard)
  // @Get('me')
  // async getCurrentUser(@Req() req: RequestWithUser) {
  //   return await this.authService.getCurrentUser(req.user.id);
  // }

  private response(message: string, data: unknown) {
    return { status: true, message, data };
  }
}
