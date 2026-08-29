import { Body, Controller, Get, Param, Post, UseFilters } from '@nestjs/common';
import { CreateRoleDto, DeleteRoleDto, UpdateRoleDto } from './dto/role.dto';
import { RoleExceptionFilter } from './filters/role-exception.filter';
import { RolesService } from './roles.service';

@Controller('roles')
@UseFilters(RoleExceptionFilter)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post('create')
  async create(@Body() dto: CreateRoleDto) {
    return this.response(
      'Role created successfully.',
      await this.rolesService.create(dto),
    );
  }

  @Post('update/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.response(
      'Role updated successfully.',
      await this.rolesService.update(id, dto),
    );
  }

  @Post('delete/:id')
  async remove(@Param('id') id: string, @Body() dto: DeleteRoleDto) {
    return this.response(
      'Role deleted successfully.',
      await this.rolesService.remove(id, dto),
    );
  }

  @Get()
  async findAll() {
    return this.response(
      'Roles retrieved successfully.',
      await this.rolesService.findAll(),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.response(
      'Role retrieved successfully.',
      await this.rolesService.findOne(id),
    );
  }

  private response(message: string, data: unknown) {
    return { status: true, message, data };
  }
}
