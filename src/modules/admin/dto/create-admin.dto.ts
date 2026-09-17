import {
  IsEmail,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateAdminUserDto {
  @IsString()
  @IsNotEmpty()
  name!: string

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsOptional()
  roleId?: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters.' })
  @IsNotEmpty({ message: 'Password is required.' })
  password!: string;
}

export class AdminLoginDto {
  @IsEmail({}, { message: 'Invalid email address.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required.' })
  password!: string;
}

