import { IsOptional, IsString } from 'class-validator';

export class DeletePropertyDto {
  @IsOptional()
  @IsString()
  updatedBy?: string;
}
