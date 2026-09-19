import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { OtpRequestDto } from './dto/otp-request.dto';
import { OtpVerifyDto } from './dto/otp-verify.dto';
// import { RegisterDto } from './dto/register.dto';
import { User } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtPayload, SafeUserResponse } from './types/auth-user.type';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) { }

  async create(dto: Partial<User>): Promise<User> {
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }
    const email = dto.email?.toLowerCase().trim();
    const mobileNumber = dto.mobileNumber?.trim();
    const mobileCountryCode = dto.mobileCountryCode?.trim();

    const isUserExist = await this.userRepository.findOne({
      where: [
        ...(email ? [{ email }] : []),
        ...(mobileNumber ? [{ mobileNumber }] : []),
      ],
    });
    if (isUserExist) {
      throw new ConflictException('User With Same Email or Mobile Already Exists');
    }
    const user = this.userRepository.create({
      ...dto,
      ...(email && { email }),
      ...(mobileNumber && { mobileNumber }),
      ...(mobileCountryCode && { mobileCountryCode }),
    });
    return await this.userRepository.save(user);
  }

  async login(dto: LoginDto): Promise<{ accessToken: string; user: Partial<User> }> {
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

    const accessToken = await this.generateToken(user);
    return {
      accessToken,
      user: this.sanitizeUser(user),
    };
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('LOWER(user.email) = LOWER(:email)', { email: email.trim() })
      .getOne();
  }


  // async requestOtp(dto: OtpRequestDto): Promise<{ message: string; otp?: string }> {
  //   // Temporary hardcoded OTP for development / testing.
  //   // Architecture allows plugging in an OtpService -> SmsProvider (Twilio, MSG91, Firebase) later.
  //   const hardcodedOtp = '123456';

  //   return {
  //     message: 'OTP sent successfully',
  //     otp: hardcodedOtp,
  //   };
  // }

  // async verifyOtp(dto: OtpVerifyDto): Promise<{ accessToken: string; user: SafeUserResponse }> {
  //   const hardcodedOtp = '123456';
  //   if (dto.otp !== hardcodedOtp) {
  //     throw new BadRequestException('Invalid or expired OTP.');
  //   }

  //   let user = await this.usersService.findByMobile(
  //     dto.mobileCountryCode,
  //     dto.mobileNumber,
  //   );

  //   if (!user) {
  //     // Create user if not existing
  //     user = await this.usersService.create({
  //       name: `User ${dto.mobileNumber.slice(-4)}`,
  //       email: `${dto.mobileCountryCode}${dto.mobileNumber}@mobile.dhulera.local`,
  //       mobileCountryCode: dto.mobileCountryCode.trim(),
  //       mobileNumber: dto.mobileNumber.trim(),
  //       password: null,
  //     });
  //   }

  //   const accessToken = await this.generateToken(user);

  //   return {
  //     accessToken,
  //     user: this.sanitizeUser(user),
  //   };
  // }

  // async getCurrentUser(userId: string): Promise<SafeUserResponse> {
  //   const user = await this.usersService.findById(userId);
  //   if (!user) {
  //     throw new NotFoundException('User not found.');
  //   }
  //   return this.sanitizeUser(user);
  // }

  private async generateToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };
    return await this.jwtService.signAsync(payload);
  }

  sanitizeUser(user: User): Partial<User> {
    const { password: _pw, ...safe } = user as User & { password?: string };
    return safe;
  }
}
