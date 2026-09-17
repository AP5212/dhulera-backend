import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { PropertyListingTypeService } from './property-listing-type.service';
import { CreatePropertyListingTypeDto } from './dto/create-property-listing-type.dto';
import { UpdatePropertyListingTypeDto } from './dto/update-property-listing-type.dto';
import { QueryPropertyListingTypeDto } from './dto/query-property-listing-type.dto';

@Controller('property-listing-type')
export class PropertyListingTypeController {
  constructor(private readonly propertyListingTypeService: PropertyListingTypeService) { }

  @Post('create')
  async create(@Body() createPropertyListingTypeDto: CreatePropertyListingTypeDto) {
    const data = await this.propertyListingTypeService.create(createPropertyListingTypeDto);
    return this.response('Property listing type created successfully.', data);
  }

  @Post('update/:id')
  async update(
    @Param('id') id: string,
    @Body() updatePropertyListingTypeDto: UpdatePropertyListingTypeDto,
  ) {
    const data = await this.propertyListingTypeService.update(id, updatePropertyListingTypeDto);
    return this.response('Property listing type updated successfully.', data);
  }

  @Post('delete/:id')
  async remove(@Param('id') id: string) {
    const data = await this.propertyListingTypeService.remove(id);
    return this.response('Property listing type deleted successfully.', data);
  }

  @Get()
  async findAll(@Query() query: QueryPropertyListingTypeDto) {
    const data = await this.propertyListingTypeService.findAll(query);
    return this.response('Property listing types retrieved successfully.', data);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.propertyListingTypeService.findOne(id);
    return this.response('Property listing type retrieved successfully.', data);
  }

  private response(message: string, data: unknown) {
    return { status: true, message, data };
  }
}


