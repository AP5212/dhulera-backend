import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class SearchPropertyDto {
  /**
   * City / Locality search string (e.g., "TP1", "Inside SIR", "Dholera")
   */
  @IsOptional()
  @IsString()
  search_city_locality?: string;

  @IsOptional()
  @IsString()
  locality?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  q?: string;

  /**
   * Property Type (e.g., "Apartment / Flat", "Residential Plot", "Commercial Space", "Villa / House")
   */
  @IsOptional()
  @IsString()
  search_property_type?: string;

  @IsOptional()
  @IsString()
  property_type?: string;

  @IsOptional()
  @IsString()
  propertyType?: string;

  /**
   * Budget range string (e.g. "Under ₹25L", "₹25L - ₹50L", "50L-1Cr", "1Cr-3Cr", "Above 3Cr")
   */
  @IsOptional()
  @IsString()
  search_property_budget?: string;

  @IsOptional()
  @IsString()
  budget?: string;

  @IsOptional()
  @IsString()
  property_budget?: string;

  /**
   * Listing tab (e.g., "buy", "rent", "sell", "projects")
   */
  @IsOptional()
  @IsString()
  search_listing_type?: string;

  @IsOptional()
  @IsString()
  listing_type?: string;

  @IsOptional()
  @IsString()
  type?: string;

  /**
   * Quick filter category chips (e.g., "all", "inside-sir", "tp-1", "tp-2", "plots", "commercial", "construction")
   */
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  selectedChip?: string;

  /**
   * Town Planning (TP) scheme filter
   */
  @IsOptional()
  @IsString()
  property_tp?: string;

  @IsOptional()
  @IsString()
  propertyTP?: string;

  /**
   * Special Investment Region (SIR) status filter
   */
  @IsOptional()
  @IsString()
  property_sir?: string;

  @IsOptional()
  @IsString()
  propertySIR?: string;

  /**
   * Direct min / max price overrides
   */
  @IsOptional()
  @IsNumberString()
  minPrice?: string;

  @IsOptional()
  @IsNumberString()
  maxPrice?: string;

  /**
   * Sort option: "recommended", "price-asc", "price-desc", "newest"
   */
  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sort_by?: string;

  /**
   * Pagination parameters
   */
  @IsOptional()
  @IsNumberString()
  currentPage?: string;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  itemsPerPage?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}
