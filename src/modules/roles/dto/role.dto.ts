import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { RoleStatus } from '../../../common/enums/role.enum';

export class CreateRoleDto {
  @IsString({ message: 'roleCode must be a string.' })
  @IsNotEmpty({ message: 'roleCode is required.' })
  @MaxLength(50, { message: 'roleCode cannot exceed 50 characters.' })
  roleCode!: string;

  @IsString({ message: 'roleName must be a string.' })
  @IsNotEmpty({ message: 'roleName is required.' })
  @MaxLength(100, { message: 'roleName cannot exceed 100 characters.' })
  roleName!: string;

  @IsOptional()
  @IsString({ message: 'description must be a string.' })
  @MaxLength(255, { message: 'description cannot exceed 255 characters.' })
  description?: string | null;

  @IsOptional()
  @IsEnum(RoleStatus, {
    message: 'status must be ACTIVE, INACTIVE, or DELETED.',
  })
  status?: RoleStatus;

  @IsOptional()
  @IsString({ message: 'createdBy must be a string.' })
  createdBy?: string;
}

export class UpdateRoleDto {
  @IsOptional()
  @IsString({ message: 'roleCode must be a string.' })
  @MaxLength(50, { message: 'roleCode cannot exceed 50 characters.' })
  roleCode?: string;

  @IsOptional()
  @IsString({ message: 'roleName must be a string.' })
  @MaxLength(100, { message: 'roleName cannot exceed 100 characters.' })
  roleName?: string;

  @IsOptional()
  @IsString({ message: 'description must be a string.' })
  @MaxLength(255, { message: 'description cannot exceed 255 characters.' })
  description?: string | null;

  @IsOptional()
  @IsEnum(RoleStatus, {
    message: 'status must be ACTIVE, INACTIVE, or DELETED.',
  })
  status?: RoleStatus;

  @IsOptional()
  @IsString({ message: 'updatedBy must be a string.' })
  updatedBy?: string;
}

export class DeleteRoleDto {
  @IsOptional()
  @IsString({ message: 'updatedBy must be a string.' })
  updatedBy?: string;
}

