import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UnauthorizedException,
  UseFilters,
} from '@nestjs/common';
import { DeleteUserDto, LoginUserDto, RegisterUserDto } from './dto/user.dto';
import { UserExceptionFilter } from './filters/user-exception.filter';
import type { AuthenticatedRequest } from './middleware/jwt-auth.middleware';
import { UsersService } from './users.service';

@Controller('users')
@UseFilters(UserExceptionFilter)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() dto: RegisterUserDto, @Req() request: AuthenticatedRequest) {
    return this.response(
      'User registered successfully.',
      await this.usersService.register(dto, this.getAuthenticatedUserId(request)),
    );
  }

  @Post('login')
  async login(@Body() dto: LoginUserDto) {
    return this.response(
      'Login successful.',
      await this.usersService.login(dto),
    );
  }

  @Get()
  async findAll() {
    return this.response(
      'Users retrieved successfully.',
      await this.usersService.findAll(),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.response(
      'User retrieved successfully.',
      await this.usersService.findOne(id),
    );
  }

  @Post('delete/:id')
  async remove(@Param('id') id: string, @Body() dto: DeleteUserDto) {
    return this.response(
      'User deleted successfully.',
      await this.usersService.remove(id, dto),
    );
  }

  private response(message: string, data: unknown) {
    return { status: true, message, data };
  }

  private getAuthenticatedUserId(request: AuthenticatedRequest): string {
    const userId = request.user?.user_id;
    if (!userId)
      throw new UnauthorizedException('Authenticated user information is missing.');
    return userId;
  }
}
