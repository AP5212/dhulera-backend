import { PartialType } from '@nestjs/mapped-types';
import { CreatePropertyTpDto } from './create-property_tp.dto';

export class UpdatePropertyTpDto extends PartialType(CreatePropertyTpDto) {}
