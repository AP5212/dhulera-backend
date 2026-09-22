import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { OtpVerifyDto } from './dto/otp-verify.dto';
import { OtpResendDto } from './dto/otp-resend.dto';
import { CreateUserDto } from './dto/register.dto';
import { JwtPayload } from './types/auth-user.type';
import { OtpService } from './services/otp.service';

export interface AuthResponseWithOtp {
  requiresOtp: boolean;
  message: string;
  email?: string;
  mobileNumber?: string | null;
  debugOtp?: string;
}

export interface AuthSuccessResponse {
  accessToken: string;
  user: Partial<User>;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
  ) {}

  /**
   * Registration Flow with OTP:
   * Hashes password, generates OTP, persists user with userOtp and otpValidTill,
   * sends OTP via SMS or prints to console, and returns requiresOtp response.
   */
  async create(dto: CreateUserDto): Promise<AuthResponseWithOtp> {
    const email = dto.email.toLowerCase().trim();
    const mobileNumber = dto.mobileNumber?.trim();
    const mobileCountryCode = dto.mobileCountryCode?.trim() || '+91';

    const existingUser = await this.userRepository.findOne({
      where: [
        { email },
        ...(mobileNumber ? [{ mobileNumber }] : []),
      ],
    });

    if (existingUser) {
      if (existingUser.status === UserStatus.ACTIVE && !existingUser.isDeleted) {
        throw new ConflictException('User with this email or mobile number already exists.');
      }
    }

    let hashedPassword: string | null = null;
    if (dto.password) {
      hashedPassword = await bcrypt.hash(dto.password, 10);
    }

    const { otp, validTill } = this.otpService.generateOtp(10);

    let user: User;
    if (existingUser) {
      // Re-use unverified/inactive user entry
      existingUser.name = dto.name.trim();
      existingUser.email = email;
      existingUser.mobileCountryCode = mobileCountryCode;
      existingUser.mobileNumber = mobileNumber || null;
      if (hashedPassword) existingUser.password = hashedPassword;
      existingUser.userOtp = otp;
      existingUser.otpValidTill = validTill;
      existingUser.status = UserStatus.INACTIVE;
      user = await this.userRepository.save(existingUser);
    } else {
      user = this.userRepository.create({
        name: dto.name.trim(),
        email,
        mobileCountryCode,
        mobileNumber: mobileNumber || null,
        password: hashedPassword,
        isPropertyUser: dto.isPropertyUser ?? false,
        roleId: dto.roleId || '2',
        status: UserStatus.INACTIVE,
        userOtp: otp,
        otpValidTill: validTill,
      });
      user = await this.userRepository.save(user);
    }

    // Trigger OTP sending / console logging
    await this.otpService.sendOtp({
      email: user.email,
      mobileNumber: user.mobileNumber,
      mobileCountryCode: user.mobileCountryCode,
      otp,
      reason: 'registration',
    });

    const isDev = process.env.NODE_ENV !== 'production';

    return {
      requiresOtp: true,
      message: 'Registration initiated. Please enter the OTP sent to your registered mobile/email.',
      email: user.email,
      mobileNumber: user.mobileNumber,
      ...(isDev ? { debugOtp: otp } : {}),
    };
  }

  /**
   * Login Flow with OTP:
   * Verifies credentials, generates a new OTP, stores it in DB,
   * sends OTP via SMS or console, and requires OTP verification.
   */
  async login(dto: LoginDto): Promise<AuthResponseWithOtp> {
    const user = await this.findByEmailWithPassword(dto.email);

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (user.isDeleted) {
      throw new UnauthorizedException('This account has been deactivated.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const { otp, validTill } = this.otpService.generateOtp(10);

    user.userOtp = otp;
    user.otpValidTill = validTill;
    await this.userRepository.save(user);

    await this.otpService.sendOtp({
      email: user.email,
      mobileNumber: user.mobileNumber,
      mobileCountryCode: user.mobileCountryCode,
      otp,
      reason: 'login',
    });

    const isDev = process.env.NODE_ENV !== 'production';

    return {
      requiresOtp: true,
      message: 'OTP sent to your registered mobile/email. Please verify to complete login.',
      email: user.email,
      mobileNumber: user.mobileNumber,
      ...(isDev ? { debugOtp: otp } : {}),
    };
  }

  /**
   * Verify OTP Flow (Unified for Registration & Login):
   * Validates OTP from dhulera_users (user_otp, otp_valid_till),
   * clears OTP fields, activates account, and issues JWT token.
   */
  async verifyOtp(dto: OtpVerifyDto): Promise<AuthSuccessResponse> {
    const email = dto.email?.toLowerCase().trim();
    const mobileNumber = dto.mobileNumber?.trim();

    if (!email && !mobileNumber) {
      throw new BadRequestException('Email or mobile number is required for OTP verification.');
    }

    const user = await this.userRepository.findOne({
      where: [
        ...(email ? [{ email }] : []),
        ...(mobileNumber ? [{ mobileNumber }] : []),
      ],
    });

    if (!user) {
      throw new NotFoundException('User not found with provided email or mobile number.');
    }

    if (!user.userOtp) {
      throw new BadRequestException('No active OTP request found. Please request a new OTP.');
    }

    if (user.userOtp.trim() !== dto.otp.trim()) {
      throw new BadRequestException('Invalid OTP entered. Please check and try again.');
    }

    if (user.otpValidTill && new Date() > new Date(user.otpValidTill)) {
      throw new BadRequestException('OTP has expired. Please request a new OTP.');
    }

    // OTP verified successfully: clear OTP and activate user
    user.userOtp = null;
    user.otpValidTill = null;
    user.status = UserStatus.ACTIVE;
    await this.userRepository.save(user);

    const accessToken = await this.generateToken(user);

    return {
      accessToken,
      user: this.sanitizeUser(user),
    };
  }

  /**
   * Resend OTP Flow:
   * Generates a fresh OTP, updates DB record, and re-dispatches OTP.
   */
  async resendOtp(dto: OtpResendDto): Promise<AuthResponseWithOtp> {
    const email = dto.email?.toLowerCase().trim();
    const mobileNumber = dto.mobileNumber?.trim();

    if (!email && !mobileNumber) {
      throw new BadRequestException('Email or mobile number is required to resend OTP.');
    }

    const user = await this.userRepository.findOne({
      where: [
        ...(email ? [{ email }] : []),
        ...(mobileNumber ? [{ mobileNumber }] : []),
      ],
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (user.isDeleted) {
      throw new UnauthorizedException('This account has been deactivated.');
    }

    const { otp, validTill } = this.otpService.generateOtp(10);
    user.userOtp = otp;
    user.otpValidTill = validTill;
    await this.userRepository.save(user);

    await this.otpService.sendOtp({
      email: user.email,
      mobileNumber: user.mobileNumber,
      mobileCountryCode: user.mobileCountryCode,
      otp,
      reason: 'resend',
    });

    const isDev = process.env.NODE_ENV !== 'production';

    return {
      requiresOtp: true,
      message: 'A new OTP has been sent successfully.',
      email: user.email,
      mobileNumber: user.mobileNumber,
      ...(isDev ? { debugOtp: otp } : {}),
    };
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('LOWER(user.email) = LOWER(:email)', { email: email.toLowerCase().trim() })
      .getOne();
  }

  private async generateToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };
    return await this.jwtService.signAsync(payload);
  }

  sanitizeUser(user: User): Partial<User> {
    const { password: _pw, userOtp: _uo, otpValidTill: _ovt, ...safe } = user as User & {
      password?: string;
      userOtp?: string | null;
      otpValidTill?: Date | null;
    };
    return safe;
  }
}
