import { MasterCategoryStatus, MasterCategoryType } from '../../../common/enums/master-category.enum';

export class UpdateMasterCategoryDto {
  categoryType?: MasterCategoryType;
  categoryName?: string;
  parentId?: string | null;
  updatedBy!: string;
  status?: MasterCategoryStatus;
}
