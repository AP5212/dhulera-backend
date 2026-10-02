import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { MasterCategoryStatus, MasterCategoryType } from '../../../common/enums/master-category.enum';

export class CreateMasterCategoryDto {
  @IsEnum(MasterCategoryType, {
    message: 'categoryType must be PROPERTY_TYPE, PROPERTY_ZONE, AMENITY, or LOCATION.',
  })
  @IsNotEmpty({ message: 'categoryType is required.' })
  categoryType!: MasterCategoryType;

  @IsString({ message: 'categoryName must be a string.' })
  @IsNotEmpty({ message: 'categoryName is required.' })
  categoryName!: string;

  @IsOptional()
  parentId?: string | null;

  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsEnum(MasterCategoryStatus, {
    message: 'status must be ACTIVE, INACTIVE, or DELETED.',
  })
  status?: MasterCategoryStatus;
}
