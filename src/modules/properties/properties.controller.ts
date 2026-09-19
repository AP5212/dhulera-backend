import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import type { AuthenticatedRequest } from '../users/middleware/jwt-auth.middleware';
import { CreatePropertyDto } from './dto/create-property.dto';
import { DeletePropertyDto } from './dto/delete-property.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { SearchPropertyDto } from './dto/search-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyExceptionFilter } from './filters/property-exception.filter';
import { PropertiesService } from './properties.service';
import type { PropertyUploadedFiles } from './properties.service';

@Controller('properties')
@UseFilters(PropertyExceptionFilter)
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) { }

  /**
   * POST /properties/create
   * Accepts multiple images (up to 10) via form-data field: property_image
   * createdBy is automatically extracted from the JWT token.
   */
  @Post('create')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'property_image', maxCount: 10 },
      { name: 'propertyImage', maxCount: 10 },
      { name: 'property_broucher', maxCount: 1 },
      { name: 'propertyBroucher', maxCount: 1 },
    ]),
  )
  async create(
    @Body() body: CreatePropertyDto,
    @UploadedFiles() files: any,
    @Req() request: AuthenticatedRequest,
  ) {
    const createdBy = request?.user?.user_id;
    const normalised: PropertyUploadedFiles = {
      propertyImage: [
        ...(files?.property_image ?? []),
        ...(files?.propertyImage ?? []),
      ],
      propertyBroucher: [
        ...(files?.property_broucher ?? []),
        ...(files?.propertyBroucher ?? []),
      ],
    };
    const property = await this.propertiesService.create(body, normalised, createdBy);
    return this.response('Property created successfully.', property);
  }

  /**
   * POST /properties/update/:id
   * Appends new images and updates property fields.
   * updatedBy is automatically extracted from the JWT token.
   */
  @Post('update/:id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'property_image', maxCount: 10 },
      { name: 'propertyImage', maxCount: 10 },
      { name: 'property_broucher', maxCount: 1 },
      { name: 'propertyBroucher', maxCount: 1 },
    ]),
  )
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePropertyDto,
    @UploadedFiles() files: any,
    @Req() request: AuthenticatedRequest,
  ) {
    const updatedBy = request?.user?.user_id;
    const normalised: PropertyUploadedFiles = {
      propertyImage: [
        ...(files?.property_image ?? []),
        ...(files?.propertyImage ?? []),
      ],
      propertyBroucher: [
        ...(files?.property_broucher ?? []),
        ...(files?.propertyBroucher ?? []),
      ],
    };
    const property = await this.propertiesService.update(id, dto, normalised, updatedBy);
    return this.response('Property updated successfully.', property);
  }

  @Post('delete/:id')
  async remove(@Param('id') id: string, @Body() dto: DeletePropertyDto) {
    const property = await this.propertiesService.remove(id, dto);
    return this.response('Property deleted successfully.', property);
  }

  @Get()
  async findAll(@Query() query: SearchPropertyDto) {
    const hasSearchCriteria =
      query.search_city_locality ||
      query.locality ||
      query.city ||
      query.q ||
      query.search_property_type ||
      query.property_type ||
      query.propertyType ||
      query.search_property_budget ||
      query.budget ||
      query.property_budget ||
      query.search_listing_type ||
      query.listing_type ||
      query.type ||
      query.category ||
      query.selectedChip ||
      query.property_tp ||
      query.propertyTP ||
      query.property_sir ||
      query.propertySIR ||
      query.minPrice ||
      query.maxPrice ||
      query.sortBy ||
      query.sort_by;

    if (hasSearchCriteria) {
      return this.propertiesService.search(query);
    }

    const currentPage = Math.max(parseInt(query.currentPage ?? query.page ?? '1', 10) || 1, 1);
    const itemsPerPage = Math.max(parseInt(query.itemsPerPage ?? query.limit ?? '10', 10) || 10, 1);
    const result = await this.propertiesService.findAll(currentPage, itemsPerPage);
    return { status: true, message: 'Properties retrieved successfully.', ...result };
  }

  /**
   * GET /properties/search
   * Search properties by city/locality, property type, budget, listing type, chips, etc.
   */
  @Get('search')
  async searchGet(@Query() query: SearchPropertyDto) {
    return this.propertiesService.search(query);
  }

  /**
   * POST /properties/search
   * Search properties via request body or query params
   */
  @Post('search')
  async searchPost(@Body() body: SearchPropertyDto, @Query() query: SearchPropertyDto) {
    const merged = { ...query, ...body };
    return this.propertiesService.search(merged);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const property = await this.propertiesService.findOne(id);
    return this.response('Property retrieved successfully.', property);
  }

  private response(message: string, data: unknown) {
    return { status: true, message, data };
  }
}
