import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from '../users/entities/user.entity';
import { AdminLoginDto, CreateAdminUserDto } from './dto/create-admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly adminRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(dto: CreateAdminUserDto): Promise<{ accessToken: string; user: Partial<User> }> {
    const email = dto.email.toLowerCase().trim();
    const isAdminExist = await this.adminRepository.findOne({
      where: { email },
    });
    if (isAdminExist && !isAdminExist.isDeleted) {
      throw new ConflictException('Admin with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const adminUser = this.adminRepository.create({
      ...dto,
      email,
      roleId: '1',
      password: hashedPassword,
      status: UserStatus.ACTIVE,
      isDeleted: false,
    });
    const saved = await this.adminRepository.save(adminUser);
    const accessToken = await this.generateToken(saved);
    return { accessToken, user: this.sanitizeUser(saved) };
  }

  async login(dto: AdminLoginDto): Promise<{ accessToken: string; user: Partial<User> }> {
    const email = dto.email.toLowerCase().trim();
    const adminUser = await this.adminRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('LOWER(user.email) = LOWER(:email)', { email })
      .getOne();

    if (!adminUser || !adminUser.password) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (adminUser.isDeleted) {
      throw new UnauthorizedException('This account has been deactivated.');
    }

    if (adminUser.status === UserStatus.INACTIVE) {
      throw new UnauthorizedException('This account is inactive.');
    }

    const isValid = await bcrypt.compare(dto.password, adminUser.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const accessToken = await this.generateToken(adminUser);
    return { accessToken, user: this.sanitizeUser(adminUser) };
  }

  private async generateToken(user: User): Promise<string> {
    const payload = {
      sub: String(user.id),
      user_id: String(user.id),
      id: String(user.id),
      email: user.email,
      roleId: user.roleId ? String(user.roleId) : '1',
      name: user.name,
    };
    return await this.jwtService.signAsync(payload);
  }

  private sanitizeUser(user: User): Partial<User> {
    const { password: _pw, userOtp: _uo, otpValidTill: _ovt, ...safe } = user as User & {
      password?: string;
      userOtp?: string | null;
      otpValidTill?: Date | null;
    };
    return safe;
  }
}
