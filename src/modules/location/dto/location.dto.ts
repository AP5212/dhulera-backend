import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { LocationStatus } from '../../../common/enums/location.enum';

export class CreateStateDto {
  @IsString({ message: 'stateCode must be a string.' })
  @IsNotEmpty({ message: 'stateCode is required.' })
  stateCode!: string;

  @IsString({ message: 'stateName must be a string.' })
  @IsNotEmpty({ message: 'stateName is required.' })
  stateName!: string;

  @IsOptional()
  @IsString()
  stateLatitude?: string;

  @IsOptional()
  @IsString()
  stateLongitude?: string;

  @IsOptional()
  @IsString()
  state_latitude?: string;

  @IsOptional()
  @IsString()
  state_longitude?: string;

  @IsOptional()
  @IsEnum(LocationStatus, {
    message: 'status must be ACTIVE, INACTIVE, or DELETED.',
  })
  status?: LocationStatus;

  @IsOptional()
  @IsString()
  createdBy?: string;
}

export class UpdateStateDto {
  @IsOptional()
  @IsString()
  stateCode?: string;

  @IsOptional()
  @IsString()
  stateName?: string;

  @IsOptional()
  @IsString()
  stateLatitude?: string;

  @IsOptional()
  @IsString()
  stateLongitude?: string;

  @IsOptional()
  @IsString()
  state_latitude?: string;

  @IsOptional()
  @IsString()
  state_longitude?: string;

  @IsOptional()
  @IsString()
  updatedBy?: string;

  @IsOptional()
  @IsEnum(LocationStatus)
  status?: LocationStatus;
}

export class CreateDistrictDto {
  @IsString({ message: 'stateId must be a string.' })
  @IsNotEmpty({ message: 'stateId is required.' })
  stateId!: string;

  @IsString({ message: 'districtCode must be a string.' })
  @IsNotEmpty({ message: 'districtCode is required.' })
  districtCode!: string;

  @IsString({ message: 'districtName must be a string.' })
  @IsNotEmpty({ message: 'districtName is required.' })
  districtName!: string;

  @IsOptional()
  @IsString()
  districtLatitude?: string;

  @IsOptional()
  @IsString()
  districtLongitude?: string;

  @IsOptional()
  @IsString()
  stateLongitude?: string;

  @IsOptional()
  @IsString()
  district_latitude?: string;

  @IsOptional()
  @IsString()
  district_longitude?: string;

  @IsOptional()
  @IsString()
  state_longitude?: string;

  @IsOptional()
  @IsEnum(LocationStatus)
  status?: LocationStatus;

  @IsOptional()
  @IsString()
  createdBy?: string;
}

export class UpdateDistrictDto {
  @IsOptional()
  @IsString()
  stateId?: string;

  @IsOptional()
  @IsString()
  districtCode?: string;

  @IsOptional()
  @IsString()
  districtName?: string;

  @IsOptional()
  @IsString()
  districtLatitude?: string;

  @IsOptional()
  @IsString()
  districtLongitude?: string;

  @IsOptional()
  @IsString()
  stateLongitude?: string;

  @IsOptional()
  @IsString()
  district_latitude?: string;

  @IsOptional()
  @IsString()
  district_longitude?: string;

  @IsOptional()
  @IsString()
  state_longitude?: string;

  @IsOptional()
  @IsString()
  updatedBy?: string;

  @IsOptional()
  @IsEnum(LocationStatus)
  status?: LocationStatus;
}

export class CreateSubDistrictDto {
  @IsString({ message: 'districtId must be a string.' })
  @IsNotEmpty({ message: 'districtId is required.' })
  districtId!: string;

  @IsString({ message: 'subDistrictCode must be a string.' })
  @IsNotEmpty({ message: 'subDistrictCode is required.' })
  subDistrictCode!: string;

  @IsString({ message: 'subDistrictName must be a string.' })
  @IsNotEmpty({ message: 'subDistrictName is required.' })
  subDistrictName!: string;

  @IsOptional()
  @IsString()
  subDistrictLatitude?: string;

  @IsOptional()
  @IsString()
  subDistrictLongitude?: string;

  @IsOptional()
  @IsString()
  sub_district_latitude?: string;

  @IsOptional()
  @IsString()
  sub_district_longitude?: string;

  @IsOptional()
  @IsEnum(LocationStatus)
  status?: LocationStatus;

  @IsOptional()
  @IsString()
  createdBy?: string;
}

export class UpdateSubDistrictDto {
  @IsOptional()
  @IsString()
  districtId?: string;

  @IsOptional()
  @IsString()
  subDistrictCode?: string;

  @IsOptional()
  @IsString()
  subDistrictName?: string;

  @IsOptional()
  @IsString()
  subDistrictLatitude?: string;

  @IsOptional()
  @IsString()
  subDistrictLongitude?: string;

  @IsOptional()
  @IsString()
  sub_district_latitude?: string;

  @IsOptional()
  @IsString()
  sub_district_longitude?: string;

  @IsOptional()
  @IsString()
  updatedBy?: string;

  @IsOptional()
  @IsEnum(LocationStatus)
  status?: LocationStatus;
}

export class DeleteLocationDto {
  @IsOptional()
  @IsString()
  updatedBy?: string;
}
