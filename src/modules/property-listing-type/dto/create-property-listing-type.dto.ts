import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePropertyListingTypeDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  key: string;

  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

