import { RoleStatus } from '../../../common/enums/role.enum';

export class CreateRoleDto {
  roleCode!: string;
  roleName!: string;
  description?: string | null;
  status?: RoleStatus;
}

export class UpdateRoleDto {
  roleCode?: string;
  roleName?: string;
  description?: string | null;
  status?: RoleStatus;
  updatedBy?: string;
}

export class DeleteRoleDto {
  updatedBy?: string;
}
