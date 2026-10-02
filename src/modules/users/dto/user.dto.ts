import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required.' })
  name!: string;

  @IsEmail({}, { message: 'Invalid email address.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email!: string;

  @IsString()
  @IsOptional()
  password?: string | null;

  @IsString()
  @IsOptional()
  mobileNumber?: string | null;

  @IsString()
  @IsOptional()
  mobileCountryCode?: string | null;

  @IsBoolean()
  @IsOptional()
  isPropertyUser?: boolean;

  @IsString()
  @IsOptional()
  roleId?: string | null;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail({}, { message: 'Invalid email address.' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  mobileNumber?: string | null;

  @IsString()
  @IsOptional()
  mobileCountryCode?: string | null;

  @IsBoolean()
  @IsOptional()
  isPropertyUser?: boolean;

  @IsString()
  @IsOptional()
  roleId?: string | null;
}

export class LoginUserDto {
  @IsEmail({}, { message: 'Invalid email address.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required.' })
  password!: string;
}
