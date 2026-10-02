import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { User, UserStatus } from './entities/user.entity';
import { LoginUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const email = userData.email?.toLowerCase().trim();
    if (!email) {
      throw new BadRequestException('Email is required.');
    }

    const mobileNumber = userData.mobileNumber && userData.mobileNumber.trim() !== ''
      ? userData.mobileNumber.trim()
      : null;
    const mobileCountryCode = userData.mobileCountryCode && userData.mobileCountryCode.trim() !== ''
      ? userData.mobileCountryCode.trim()
      : null;

    const whereConditions: Array<{ email?: string; mobileNumber?: string }> = [{ email }];
    if (mobileNumber) {
      whereConditions.push({ mobileNumber });
    }

    const isUserExist = await this.userRepository.findOne({
      where: whereConditions,
    });
    if (isUserExist) {
      throw new ConflictException('User with same email or mobile number already exists');
    }

    let hashedPassword = userData.password;
    if (hashedPassword && !hashedPassword.startsWith('$2b$') && !hashedPassword.startsWith('$2a$')) {
      hashedPassword = await bcrypt.hash(hashedPassword, 10);
    }

    const user = this.userRepository.create({
      ...userData,
      name: userData.name?.trim() || email.split('@')[0],
      email,
      mobileNumber,
      mobileCountryCode,
      password: hashedPassword || null,
      roleId: userData.roleId || null,
      isPropertyUser: userData.isPropertyUser ?? false,
      status: userData.status || UserStatus.ACTIVE,
      isDeleted: false,
    });

    return await this.userRepository.save(user);
  }

  async findById(id: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email: email.toLowerCase().trim() },
    });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('LOWER(user.email) = LOWER(:email)', { email: email.toLowerCase().trim() })
      .getOne();
  }

  async findByMobile(
    mobileCountryCode: string,
    mobileNumber: string,
  ): Promise<User | null> {
    return await this.userRepository.findOne({
      where: {
        mobileCountryCode: mobileCountryCode.trim(),
        mobileNumber: mobileNumber.trim(),
      },
    });
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      where: { isDeleted: false },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneOrFail(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id '${id}' was not found.`);
    }
    return user;
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findOneOrFail(id);

    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase().trim();
      if (updateData.email !== user.email) {
        const existing = await this.findByEmail(updateData.email);
        if (existing && existing.id !== id) {
          throw new ConflictException('User with this email already exists.');
        }
      }
    }

    if (updateData.mobileNumber !== undefined) {
      updateData.mobileNumber =
        updateData.mobileNumber && updateData.mobileNumber.trim() !== ''
          ? updateData.mobileNumber.trim()
          : null;
    }

    if (updateData.mobileCountryCode !== undefined) {
      updateData.mobileCountryCode =
        updateData.mobileCountryCode && updateData.mobileCountryCode.trim() !== ''
          ? updateData.mobileCountryCode.trim()
          : null;
    }

    if (updateData.password) {
      if (!updateData.password.startsWith('$2b$') && !updateData.password.startsWith('$2a$')) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }
    }

    Object.assign(user, updateData);
    return await this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOneOrFail(id);
    user.isDeleted = true;
    user.status = UserStatus.INACTIVE;
    await this.userRepository.save(user);
  }

  /**
   * Direct Email & Password Login
   */
  async login(dto: LoginUserDto): Promise<{ accessToken: string; user: Partial<User> }> {
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
      accessToken,
      user: this.sanitizeUser(user),
    };
  }

  async generateToken(user: User): Promise<string> {
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
