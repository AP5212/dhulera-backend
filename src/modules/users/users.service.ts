import {
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
  ) { }

  async create(userData: Partial<User>): Promise<User> {
    const email = userData.email?.toLowerCase().trim();
    const mobileNumber = userData.mobileNumber?.trim();
    const mobileCountryCode = userData.mobileCountryCode?.trim();

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
      ...userData,
      ...(email && { email }),
      ...(mobileNumber && { mobileNumber }),
      ...(mobileCountryCode && { mobileCountryCode }),
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
      .where('LOWER(user.email) = LOWER(:email)', { email: email.trim() })
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
    Object.assign(user, updateData);
    return await this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOneOrFail(id);
    await this.userRepository.remove(user);
  }



  async login(dto: LoginUserDto): Promise<{ accessToken: string; user: Partial<User> }> {
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

  async generateToken(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
    };
    return await this.jwtService.signAsync(payload);
  }

  sanitizeUser(user: User): Partial<User> {
    const { password: _pw, ...safe } = user as User & { password?: string };
    return safe;
  }
}
