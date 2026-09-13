import { IsNotEmpty, IsString } from 'class-validator';

export class OtpVerifyDto {
  @IsString()
  @IsNotEmpty({ message: 'Mobile country code is required.' })
  mobileCountryCode!: string;

  @IsString()
  @IsNotEmpty({ message: 'Mobile number is required.' })
  mobileNumber!: string;

  @IsString()
  @IsNotEmpty({ message: 'OTP is required.' })
  otp!: string;
}
