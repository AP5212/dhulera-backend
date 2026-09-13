import { IsOptional, IsString } from 'class-validator';
import { CreatePropertyDto } from './create-property.dto';

export class UpdatePropertyDto extends CreatePropertyDto {
  @IsOptional()
  @IsString()
  updatedBy?: string;
}
