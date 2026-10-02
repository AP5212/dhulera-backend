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
import { OtpService } from './services/otp.service';

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
   * Direct Registration with Email & Password:
   * Hashes password, persists user, generates JWT token immediately.
   */
  async create(dto: CreateUserDto): Promise<{ message: string; accessToken: string; user: Partial<User> }> {
    const email = dto.email.toLowerCase().trim();
    const mobileNumber = dto.mobileNumber && dto.mobileNumber.trim() !== ''
      ? dto.mobileNumber.trim()
      : null;
    const mobileCountryCode = dto.mobileCountryCode && dto.mobileCountryCode.trim() !== ''
      ? dto.mobileCountryCode.trim()
      : null;

    const whereConditions: Array<{ email?: string; mobileNumber?: string }> = [{ email }];
    if (mobileNumber) {
      whereConditions.push({ mobileNumber });
    }

    const existingUser = await this.userRepository.findOne({
      where: whereConditions,
    });

    if (existingUser && !existingUser.isDeleted) {
      throw new ConflictException('User with this email or mobile number already exists.');
    }

    let hashedPassword: string | null = null;
    if (dto.password) {
      hashedPassword = await bcrypt.hash(dto.password, 10);
    }

    let user: User;
    if (existingUser && existingUser.isDeleted) {
      existingUser.name = dto.name.trim();
      existingUser.email = email;
      existingUser.mobileCountryCode = mobileCountryCode;
      existingUser.mobileNumber = mobileNumber;
      if (hashedPassword) existingUser.password = hashedPassword;
      existingUser.status = UserStatus.ACTIVE;
      existingUser.isDeleted = false;
      user = await this.userRepository.save(existingUser);
    } else {
      user = this.userRepository.create({
        name: dto.name.trim(),
        email,
        mobileCountryCode,
        mobileNumber,
        password: hashedPassword,
        isPropertyUser: dto.isPropertyUser ?? false,
        roleId: dto.roleId || null,
        status: UserStatus.ACTIVE,
        isDeleted: false,
      });
      user = await this.userRepository.save(user);
    }

    const accessToken = await this.generateToken(user);

    return {
      message: 'User registered successfully.',
      accessToken,
      user: this.sanitizeUser(user),
    };
  }

  /**
   * Direct Login with Email & Password:
   * Validates credentials and returns JWT access token.
   */
  async login(dto: LoginDto): Promise<{ message: string; accessToken: string; user: Partial<User> }> {
    const email = dto.email.toLowerCase().trim();
    const user = await this.findByEmailWithPassword(email);

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (user.isDeleted) {
      throw new UnauthorizedException('This account has been deactivated.');
    }

    if (user.status === UserStatus.INACTIVE) {
      throw new UnauthorizedException('This account is inactive.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const accessToken = await this.generateToken(user);

    return {
      message: 'Login successful.',
      accessToken,
      user: this.sanitizeUser(user),
    };
  }

  /**
   * Verify OTP Flow:
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
   */
  async resendOtp(dto: OtpResendDto): Promise<{ message: string; email?: string; mobileNumber?: string | null }> {
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

    return {
      message: 'A new OTP has been sent successfully.',
      email: user.email,
      mobileNumber: user.mobileNumber,
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
    const payload = {
      sub: String(user.id),
      user_id: String(user.id),
      id: String(user.id),
      email: user.email,
      roleId: user.roleId ? String(user.roleId) : null,
      name: user.name,
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
