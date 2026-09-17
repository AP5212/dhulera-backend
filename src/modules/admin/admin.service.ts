import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { JwtPayload } from '../auth/types/auth-user.type';
import { Role } from '../roles/entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AdminLoginDto, CreateAdminUserDto } from './dto/create-admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly adminRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) { }

  async create(dto: CreateAdminUserDto): Promise<{ accessToken: string; user: Partial<User> }> {
    dto.roleId = "1";
    const isAdminExist = await this.adminRepository.findOne({
      where: [
        { email: dto.email },
      ]
    });
    if (isAdminExist) {
      throw new ConflictException('Admin with this email or mobile number already exists')
    }
    dto.password = await bcrypt.hash(dto.password, 10);
    const adminUser = await this.adminRepository.save(dto);
    const accessToken = await this.generateToken(adminUser);
    return { accessToken, user: this.sanitizeUser(adminUser) };
  }

  async login(dto: AdminLoginDto): Promise<{ accessToken: string; user: Partial<User> }> {

    const adminUser = await this.adminRepository.findOneBy({ email: dto.email });
    if (!adminUser || !adminUser.password) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isValid = await bcrypt.compare(dto.password, adminUser.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const accessToken = await this.generateToken(adminUser);
    return { accessToken, user: this.sanitizeUser(adminUser) };
  }

  private async generateToken(user: User): Promise<string> {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    return await this.jwtService.signAsync(payload);
  }

  private sanitizeUser(user: User): Partial<User> {
    const { password: _pw, ...safe } = user as User & { password?: string };
    return safe;
  }
}

