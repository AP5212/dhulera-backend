import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async create(userData: Partial<User>): Promise<User> {
    const isUserExist = await this.userRepository.findOne({
      where: [
        ...(userData.email ? [{ email: userData.email }] : []),
        ...(userData.mobileNumber ? [{ mobileNumber: userData.mobileNumber }] : []),
      ],
    });
    if (isUserExist) {
      throw new ConflictException('User With Same Email or Mobile Already Exists');
    }
    const user = this.userRepository.create(userData);
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



  sanitizeUser(user: User): Partial<User> {
    const { password: _pw, ...safe } = user as User & { password?: string };
    return safe;
  }
}
