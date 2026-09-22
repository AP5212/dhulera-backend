import { IsEmail, IsOptional, IsString } from 'class-validator';

export class OtpResendDto {
  @IsEmail({}, { message: 'Invalid email address.' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  mobileCountryCode?: string;

  @IsString()
  @IsOptional()
  mobileNumber?: string;
}
