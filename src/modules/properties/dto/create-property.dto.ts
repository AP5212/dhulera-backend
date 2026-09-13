import { IsOptional, IsString } from 'class-validator';

export class CreatePropertyDto {
  @IsOptional()
  @IsString()
  propertyName?: string;

  @IsOptional()
  @IsString()
  properyName?: string;

  @IsOptional()
  propertyMinPrice?: number | string;

  @IsOptional()
  properytMinPrice?: number | string;

  @IsOptional()
  propertyMaxPrice?: number | string;

  @IsOptional()
  @IsString()
  propertyAddress?: string;

  @IsOptional()
  @IsString()
  propertyLattitude?: string;

  @IsOptional()
  @IsString()
  propertyLatitude?: string;

  @IsOptional()
  @IsString()
  propertyLongitude?: string;

  @IsOptional()
  @IsString()
  propertyStatus?: string;

  @IsOptional()
  @IsString()
  propertyDescription?: string;

  @IsOptional()
  @IsString()
  propertyArea?: string;

  @IsOptional()
  @IsString()
  propertyImage?: string;

  @IsOptional()
  @IsString()
  propertyTP?: string;

  @IsOptional()
  @IsString()
  propertySIR?: string;

  @IsOptional()
  @IsString()
  propertyListingType?: string;

  @IsOptional()
  @IsString()
  propertyBroucher?: string;

  @IsOptional()
  @IsString()
  propertyBrochure?: string;
}
