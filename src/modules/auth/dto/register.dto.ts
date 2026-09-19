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