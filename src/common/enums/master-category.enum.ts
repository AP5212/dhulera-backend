export enum MasterCategoryType {
  PROPERTY_TYPE = 'PROPERTY_TYPE',
  TP = 'TP',
  SIR = 'SIR',
  PROPERTY_ZONE = 'PROPERTY_ZONE',
  AMENITY = 'AMENITY',
  LOCATION = 'LOCATION',
  PROPERTY_LISTING_TYPE = 'PROPERTY_LISTING_TYPE',
}

export type MasterCategoryTypeValue =
  | 'PROPERTY_TYPE'
  | 'TP'
  | 'SIR'
  | 'PROPERTY_ZONE'
  | 'AMENITY'
  | 'LOCATION'
  | 'PROPERTY_LISTING_TYPE';

export enum MasterCategoryStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
}
