import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto/user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post('create')
  async create(@Body() createUserDto: CreateUserDto) {
    const data = await this.usersService.create(createUserDto);
    return this.response('User created successfully.', this.usersService.sanitizeUser(data));
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginUserDto) {
    const data = await this.usersService.login(loginDto);
    return this.response('Login successful.', data);
  }

  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return this.response(
      'Users retrieved successfully.',
      users.map((u) => this.usersService.sanitizeUser(u)),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOneOrFail(id);
    return this.response('User retrieved successfully.', this.usersService.sanitizeUser(user));
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const user = await this.usersService.update(id, dto);
    return this.response('User updated successfully.', this.usersService.sanitizeUser(user));
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
    return this.response('User deleted successfully.', null);
  }

  private response(message: string, data: unknown) {
    return { status: true, message, data };
  }
}