import { IsNotEmpty, IsString } from 'class-validator';

export class OtpRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'Mobile country code is required.' })
  mobileCountryCode!: string;

  @IsString()
  @IsNotEmpty({ message: 'Mobile number is required.' })
  mobileNumber!: string;
}
