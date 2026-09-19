import { IsBoolean, IsNumber, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsOptional()
  mobileCountryCode?: string | null;

  @IsString()
  @IsOptional()
  mobileNumber?: string | null;

  @IsBoolean()
  @IsOptional()
  isPropertyUser?: boolean;

  @IsString()
  @IsOptional()
  roleId?: string;

  @IsString()
  @IsOptional()
  password?: string | null;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  mobileNumber?: string;

  @IsString()
  @IsOptional()
  mobileCountryCode?: string;
}

export class LoginUserDto {
  @IsEmail({}, { message: 'Invalid email address.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required.' })
  password!: string;
}
