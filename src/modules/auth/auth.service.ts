import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { OtpRequestDto } from './dto/otp-request.dto';
import { OtpVerifyDto } from './dto/otp-verify.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload, SafeUserResponse } from './types/auth-user.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) { }

  async register(dto: RegisterDto): Promise<{ message: string; user: SafeUserResponse }> {
    const existingEmail = await this.usersService.findByEmail(dto.email);
    if (existingEmail) {
      throw new ConflictException('A user with this email already exists.');
    }

    const existingMobile = await this.usersService.findByMobile(
      dto.mobileCountryCode,
      dto.mobileNumber,
    );
    if (existingMobile) {
      throw new ConflictException('A user with this mobile number already exists.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      name: dto.name.trim(),
      email: dto.email.toLowerCase().trim(),
      password: hashedPassword,
      mobileNumber: dto.mobileNumber.trim(),
      mobileCountryCode: dto.mobileCountryCode.trim(),
    });

    return {
      message: 'User registered successfully',
      user: this.sanitizeUser(user),
    };
  }

  async login(dto: LoginDto): Promise<{ accessToken: string; user: SafeUserResponse }> {
    const user = await this.usersService.findByEmailWithPassword(dto.email);

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const accessToken = await this.generateToken(user);

    return {
      accessToken,
      user: this.sanitizeUser(user),
    };
  }

  async requestOtp(dto: OtpRequestDto): Promise<{ message: string; otp?: string }> {
    // Temporary hardcoded OTP for development / testing.
    // Architecture allows plugging in an OtpService -> SmsProvider (Twilio, MSG91, Firebase) later.
    const hardcodedOtp = '123456';

    return {
      message: 'OTP sent successfully',
      otp: hardcodedOtp,
    };
  }

  async verifyOtp(dto: OtpVerifyDto): Promise<{ accessToken: string; user: SafeUserResponse }> {
    const hardcodedOtp = '123456';
    if (dto.otp !== hardcodedOtp) {
      throw new BadRequestException('Invalid or expired OTP.');
    }

    let user = await this.usersService.findByMobile(
      dto.mobileCountryCode,
      dto.mobileNumber,
    );

    if (!user) {
      // Create user if not existing
      user = await this.usersService.create({
        name: `User ${dto.mobileNumber.slice(-4)}`,
        email: `${dto.mobileCountryCode}${dto.mobileNumber}@mobile.dhulera.local`,
        mobileCountryCode: dto.mobileCountryCode.trim(),
        mobileNumber: dto.mobileNumber.trim(),
        password: null,
      });
    }

    const accessToken = await this.generateToken(user);

    return {
      accessToken,
      user: this.sanitizeUser(user),
    };
  }

  async getCurrentUser(userId: string): Promise<SafeUserResponse> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    return this.sanitizeUser(user);
  }

  private async generateToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };
    return await this.jwtService.signAsync(payload);
  }

  private sanitizeUser(user: User): SafeUserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      mobileNumber: user.mobileNumber,
      mobileCountryCode: user.mobileCountryCode,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
