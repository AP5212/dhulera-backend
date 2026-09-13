import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required.' })
  name!: string;

  @IsEmail({}, { message: 'Invalid email address.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  @IsNotEmpty({ message: 'Password is required.' })
  password!: string;

  @IsString()
  @IsNotEmpty({ message: 'Mobile number is required.' })
  mobileNumber!: string;

  @IsString()
  @IsNotEmpty({ message: 'Mobile country code is required.' })
  mobileCountryCode!: string;
}
