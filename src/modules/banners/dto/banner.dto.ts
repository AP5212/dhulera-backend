import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { BannerStatus } from '../../../common/enums/banner.enum';

export class CreateBannerDto {
  @IsString({ message: 'bannerName must be a string.' })
  @IsNotEmpty({ message: 'bannerName is required.' })
  @MaxLength(255, { message: 'bannerName cannot exceed 255 characters.' })
  bannerName!: string;

  @IsString({ message: 'pathOfBanner must be a string.' })
  @IsNotEmpty({ message: 'pathOfBanner is required.' })
  pathOfBanner!: string;

  @IsOptional()
  @IsNumber({}, { message: 'bannerOrder must be a number.' })
  bannerOrder?: number;

  @IsOptional()
  @IsEnum(BannerStatus, {
    message: 'status must be ACTIVE, INACTIVE, DRAFT, or DELETED.',
  })
  status?: BannerStatus;

  @IsOptional()
  @IsString({ message: 'addedBy must be a string.' })
  addedBy?: string;
}

export class UpdateBannerDto {
  @IsOptional()
  @IsString({ message: 'bannerName must be a string.' })
  @MaxLength(255, { message: 'bannerName cannot exceed 255 characters.' })
  bannerName?: string;

  @IsOptional()
  @IsString({ message: 'pathOfBanner must be a string.' })
  pathOfBanner?: string;

  @IsOptional()
  @IsNumber({}, { message: 'bannerOrder must be a number.' })
  bannerOrder?: number;

  @IsOptional()
  @IsEnum(BannerStatus, {
    message: 'status must be ACTIVE, INACTIVE, DRAFT, or DELETED.',
  })
  status?: BannerStatus;

  @IsOptional()
  @IsString({ message: 'modifiedBy must be a string.' })
  modifiedBy?: string;
}

export class DeleteBannerDto {
  @IsOptional()
  @IsString({ message: 'modifiedBy must be a string.' })
  modifiedBy?: string;
}

export class ReorderBannersDto {
  @IsArray({ message: 'orders must be an array.' })
  orders!: { bannerId: string; bannerOrder: number }[];

  @IsOptional()
  @IsString({ message: 'modifiedBy must be a string.' })
  modifiedBy?: string;
}
