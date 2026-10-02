import { IsEnum, IsOptional, IsString } from 'class-validator';
import { MasterCategoryStatus, MasterCategoryType } from '../../../common/enums/master-category.enum';

export class UpdateMasterCategoryDto {
  @IsOptional()
  @IsEnum(MasterCategoryType, {
    message: 'categoryType must be PROPERTY_TYPE, PROPERTY_ZONE, AMENITY, or LOCATION.',
  })
  categoryType?: MasterCategoryType;

  @IsOptional()
  @IsString()
  categoryName?: string;

  @IsOptional()
  parentId?: string | null;

  @IsOptional()
  @IsString()
  updatedBy?: string;

  @IsOptional()
  @IsEnum(MasterCategoryStatus, {
    message: 'status must be ACTIVE, INACTIVE, or DELETED.',
  })
  status?: MasterCategoryStatus;
}
