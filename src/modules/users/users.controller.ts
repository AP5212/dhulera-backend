import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseFilters,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/user.dto';
import { UserExceptionFilter } from './filters/user-exception.filter';
import { UsersService } from './users.service';

@Controller('users')
@UseFilters(UserExceptionFilter)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return this.response('Users retrieved successfully.', users);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOneOrFail(id);
    return this.response('User retrieved successfully.', user);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const user = await this.usersService.update(id, dto);
    return this.response('User updated successfully.', user);
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