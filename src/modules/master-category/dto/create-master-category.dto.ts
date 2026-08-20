import { MasterCategoryStatus, MasterCategoryType } from '../../../common/enums/master-category.enum';

export class CreateMasterCategoryDto {
  categoryType!: MasterCategoryType;
  categoryName!: string;
  parentId?: string | null;
  createdBy!: string;
  status?: MasterCategoryStatus;
}
