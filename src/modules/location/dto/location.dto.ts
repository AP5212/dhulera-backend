import { LocationStatus } from '../../../common/enums/location.enum';

export class CreateStateDto {
  stateCode!: string;
  stateName!: string;
  createdBy?: string;
  status?: LocationStatus;
}

export class UpdateStateDto {
  stateCode?: string;
  stateName?: string;
  updatedBy?: string;
  status?: LocationStatus;
}

export class CreateDistrictDto {
  stateId!: string;
  districtCode!: string;
  districtName!: string;
  createdBy?: string;
  status?: LocationStatus;
}

export class UpdateDistrictDto {
  stateId?: string;
  districtCode?: string;
  districtName?: string;
  updatedBy?: string;
  status?: LocationStatus;
}

export class CreateSubDistrictDto {
  districtId!: string;
  subDistrictCode!: string;
  subDistrictName!: string;
  createdBy?: string;
  status?: LocationStatus;
}

export class UpdateSubDistrictDto {
  districtId?: string;
  subDistrictCode?: string;
  subDistrictName?: string;
  updatedBy?: string;
  status?: LocationStatus;
}

export class DeleteLocationDto {
  updatedBy?: string;
}
