import { IsOptional, IsString } from 'class-validator';

export class DeleteMasterCategoryDto {
  @IsOptional()
  @IsString()
  updatedBy?: string;
}
