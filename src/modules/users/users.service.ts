import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as CryptoJS from 'crypto-js';
import { Not, Repository } from 'typeorm';
import { UserStatus } from '../../common/enums/user.enum';
import { DeleteUserDto, LoginUserDto, RegisterUserDto } from './dto/user.dto';
import { User } from './entities/user.entity';

export interface UserResponse {
  id: string;
  username: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  mobileNumber: string | null;
  roleId: string;
  parentId: string | null;
  stateId: string | null;
  districtId: string | null;
  subDistrictId: string | null;
  location: string | null;
  emailVerified: boolean;
  mobileVerified: boolean;
  lastLoginAt: Date | null;
  failedLoginCount: number;
  lockedUntil: Date | null;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date | null;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(
    dto: RegisterUserDto,
    authenticatedUserId: string,
  ): Promise<UserResponse> {
    const user = await this.userRepository.save(
      this.userRepository.create({
        username: this.requireText(dto.username, 'username'),
        firstName: this.requireText(dto.firstName, 'firstName'),
        lastName: this.optionalText(dto.lastName, 'lastName'),
        email: this.optionalEmail(dto.email),
        mobileNumber: this.optionalMobileNumber(dto.mobileNumber),
        passwordHash: this.encryptPassword(
          this.requireText(dto.password, 'password'),
        ),
        roleId: this.requireBigInt(dto.roleId, 'roleId'),
        parentId: this.optionalBigInt(dto.parentId, 'parentId'),
        stateId: this.optionalBigInt(dto.stateId, 'stateId'),
        districtId: this.optionalBigInt(dto.districtId, 'districtId'),
        subDistrictId: this.optionalBigInt(dto.subDistrictId, 'subDistrictId'),
        location: this.optionalText(dto.location, 'location'),
        status: UserStatus.ACTIVE,
        createdBy: this.requireBigInt(authenticatedUserId, 'createdBy'),
      }),
    );
    return this.toResponse(user);
  }

  async login(
    dto: LoginUserDto,
  ): Promise<{ accessToken: string }> {
    const username = this.requireText(dto.username, 'username');
    const password = this.requireText(dto.password, 'password');
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.username = :username', { username })
      .getOne();

    if (
      !user ||
      user.status !== UserStatus.ACTIVE ||
      !this.passwordMatches(password, user.passwordHash)
    ) {
      throw new UnauthorizedException('Invalid username or password.');
    }

    user.lastLoginAt = new Date();
    user.failedLoginCount = 0;
    await this.userRepository.save(user);
    const payload = {
      user_id: user.id,
      username: user.username,
      first_name: user.firstName,
      last_name: user.lastName,
      email_id: user.email,
      mobile_number: user.mobileNumber,
      role_id: user.roleId,
      parent_id: user.parentId,
      state_id: user.stateId,
      district_id: user.districtId,
      sub_district_id: user.subDistrictId,
      location: user.location,
    };
    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }

  async findAll(): Promise<UserResponse[]> {
    const users = await this.userRepository.find({
      where: { status: Not(UserStatus.DELETED) },
      order: { firstName: 'ASC', lastName: 'ASC' },
    });
    return users.map((user) => this.toResponse(user));
  }

  async findOne(id: string): Promise<UserResponse> {
    return this.toResponse(await this.findNonDeletedUser(id));
  }

  async remove(id: string, dto: DeleteUserDto): Promise<UserResponse> {
    const user = await this.findNonDeletedUser(id);
    user.status = UserStatus.DELETED;
    user.updatedBy = this.optionalBigInt(dto.updatedBy, 'updatedBy');
    return this.toResponse(await this.userRepository.save(user));
  }

  private async findNonDeletedUser(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({
      id: this.requireBigInt(id, 'id'),
    });
    if (!user || user.status === UserStatus.DELETED)
      throw new NotFoundException(`User with id '${id}' was not found.`);
    return user;
  }

  private encryptPassword(password: string): string {
    return CryptoJS.AES.encrypt(password, this.encryptionKey()).toString();
  }

  private passwordMatches(
    password: string,
    encryptedPassword: string,
  ): boolean {
    return (
      CryptoJS.AES.decrypt(encryptedPassword, this.encryptionKey()).toString(
        CryptoJS.enc.Utf8,
      ) === password
    );
  }

  private encryptionKey(): string {
    const key = this.configService.get<string>('PASSWORD_ENCRYPTION_KEY');
    if (!key)
      throw new BadRequestException(
        'PASSWORD_ENCRYPTION_KEY is not configured.',
      );
    return key;
  }

  private toResponse(user: User): UserResponse {
    return {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobileNumber: user.mobileNumber,
      roleId: user.roleId,
      parentId: user.parentId,
      stateId: user.stateId,
      districtId: user.districtId,
      subDistrictId: user.subDistrictId,
      location: user.location,
      emailVerified: user.emailVerified,
      mobileVerified: user.mobileVerified,
      lastLoginAt: user.lastLoginAt,
      failedLoginCount: user.failedLoginCount,
      lockedUntil: user.lockedUntil,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private requireText(value: unknown, fieldName: string): string {
    if (typeof value !== 'string' || !value.trim())
      throw new BadRequestException(
        `${fieldName} is required and must be a non-empty string.`,
      );
    return value.trim();
  }

  private optionalText(value: unknown, fieldName: string): string | null {
    return value === undefined || value === null
      ? null
      : this.requireText(value, fieldName);
  }

  private optionalEmail(value: unknown): string | null {
    const email = this.optionalText(value, 'email');
    if (email === null) return null;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      throw new BadRequestException('email must be a valid email address.');
    return email;
  }

  private optionalMobileNumber(value: unknown): string | null {
    const mobileNumber = this.optionalText(value, 'mobileNumber');
    if (mobileNumber === null) return null;
    if (!/^\d+$/.test(mobileNumber))
      throw new BadRequestException(
        'mobileNumber must contain digits only.',
      );
    return mobileNumber;
  }

  private requireBigInt(value: unknown, fieldName: string): string {
    const normalized = String(value ?? '');
    if (!/^\d+$/.test(normalized) || BigInt(normalized) <= 0n)
      throw new BadRequestException(`${fieldName} must be a positive integer.`);
    return normalized;
  }

  private optionalBigInt(value: unknown, fieldName: string): string | null {
    return value === undefined || value === null
      ? null
      : this.requireBigInt(value, fieldName);
  }
}
