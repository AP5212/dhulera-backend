import { IsOptional, IsString } from 'class-validator';

/**
 * Accepts both camelCase (propertyName) and snake_case (property_name) field names
 * because multipart/form-data clients (Postman, curl) send snake_case keys.
 * The service resolves the correct value using fallback operators (dto.x ?? dto.y).
 */
export class CreatePropertyDto {
  // ── camelCase variants ──────────────────────────────────────
  @IsOptional() @IsString() propertyName?: string;
  @IsOptional() @IsString() properyName?: string; // legacy typo kept for backward compat

  @IsOptional() propertyMinPrice?: number | string;
  @IsOptional() properytMinPrice?: number | string; // legacy typo

  @IsOptional() propertyMaxPrice?: number | string;

  @IsOptional() @IsString() propertyAddress?: string;
  @IsOptional() @IsString() propertyLattitude?: string;
  @IsOptional() @IsString() propertyLatitude?: string;
  @IsOptional() @IsString() propertyLongitude?: string;
  @IsOptional() @IsString() propertyStatus?: string;
  @IsOptional() @IsString() propertyDescription?: string;
  @IsOptional() @IsString() propertyArea?: string;
  @IsOptional() @IsString() propertyImage?: string;
  @IsOptional() @IsString() propertyTP?: string;
  @IsOptional() @IsString() propertySIR?: string;
  @IsOptional() @IsString() propertyListingType?: string;
  @IsOptional() @IsString() propertyBroucher?: string;
  @IsOptional() @IsString() propertyBrochure?: string;

  // ── snake_case variants (sent by Postman / curl form-data) ──
  @IsOptional() @IsString() property_name?: string;
  @IsOptional() property_min_price?: number | string;
  @IsOptional() property_max_price?: number | string;
  @IsOptional() @IsString() property_address?: string;
  @IsOptional() @IsString() property_lattitude?: string;
  @IsOptional() @IsString() property_latitude?: string;
  @IsOptional() @IsString() property_longitude?: string;
  @IsOptional() @IsString() property_status?: string;
  @IsOptional() @IsString() property_description?: string;
  @IsOptional() @IsString() property_area?: string;
  @IsOptional() @IsString() property_tp?: string;
  @IsOptional() @IsString() property_sir?: string;
  @IsOptional() @IsString() property_listing_type?: string;
  @IsOptional() @IsString() property_broucher?: string;
}

