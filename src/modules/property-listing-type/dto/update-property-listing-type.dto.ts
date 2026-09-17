import { PartialType } from '@nestjs/mapped-types';
import { CreatePropertyListingTypeDto } from './create-property-listing-type.dto';

export class UpdatePropertyListingTypeDto extends PartialType(CreatePropertyListingTypeDto) {}
