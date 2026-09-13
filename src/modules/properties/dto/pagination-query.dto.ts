import { IsOptional, IsNumberString } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @IsNumberString()
  currentPage?: string;

  @IsOptional()
  @IsNumberString()
  itemsPerPage?: string;
}
