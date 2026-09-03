export class RegisterUserDto {
  username!: string;
  firstName!: string;
  lastName?: string | null;
  email?: string | null;
  mobileNumber?: string | null;
  password!: string;
  roleId!: string;
  parentId?: string | null;
  stateId?: string | null;
  districtId?: string | null;
  subDistrictId?: string | null;
  location?: string | null;
}

export class LoginUserDto {
  username!: string;
  password!: string;
}

export class DeleteUserDto {
  updatedBy?: string;
}
