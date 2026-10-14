import { IsOptional, IsString } from 'class-validator';

/**
 * DTO fields match the Property entity property names exactly (camelCase).
 * The entity @Column({ name: '...' }) handles the DB column mapping,
 * so no snake_case duplicates are needed here.
 */
export class CreatePropertyDto {
  @IsOptional() @IsString() propertyName?: string;
  @IsOptional() propertyMinPrice?: number | string;
  @IsOptional() propertyMaxPrice?: number | string;
  @IsOptional() @IsString() propertyAddress?: string;
  @IsOptional() @IsString() propertyLattitude?: string;
  @IsOptional() @IsString() propertyLongitude?: string;
  @IsOptional() @IsString() propertyStatus?: string;
  @IsOptional() @IsString() propertyDescription?: string;
  @IsOptional() @IsString() propertyArea?: string;
  @IsOptional() @IsString() tpId?: string;
  @IsOptional() @IsString() sirId?: string;
  @IsOptional() @IsString() listingTypeId?: string;
  @IsOptional() @IsString() propertyGifVideo?: string;
  @IsOptional() @IsString() propertyCreatedByType?: string;
  @IsOptional() @IsString() oldSurvey?: string;
  @IsOptional() @IsString() newSurvey?: string;
  @IsOptional() @IsString() zone?: string;
  @IsOptional() @IsString() roadWidth?: string;
  @IsOptional() @IsString() propertyBroucher?: string;
  @IsOptional() @IsString() propertyBrochure?: string;
  @IsOptional() propertyImages?: any;
  @IsOptional() propertyImage?: any;
  @IsOptional() @IsString() propertyLatitude?: string;
  @IsOptional() @IsString() propertyVideo?: string;
}
