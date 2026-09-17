import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminLoginDto, CreateAdminUserDto } from './dto/create-admin.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  /**
   * POST /admin/users/create
   * Creates a new user and returns a JWT token immediately.
   * No separate login step required after registration.
   */
  @Post('create')
  async createUser(@Body() dto: CreateAdminUserDto) {
    const data = await this.adminService.create(dto);
    return this.response('User created successfully.', data);
  }

  /**
   * POST /admin/users/login
   * Authenticates an existing user and returns a JWT token.
   */
  @HttpCode(HttpStatus.OK)
  @Post('users/login')
  async loginUser(@Body() dto: AdminLoginDto) {
    const data = await this.adminService.login(dto);
    return this.response('Login successful.', data);
  }

  private response(message: string, data: unknown) {
    return { status: true, message, data };
  }
}

