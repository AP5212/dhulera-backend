import { IsOptional, IsString } from 'class-validator';

export class QueryPropertyListingTypeDto {
  @IsOptional()
  @IsString()
  isDelete?: string;

  @IsOptional()
  @IsString()
  isDeleted?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
