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
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyExceptionFilter } from './filters/property-exception.filter';
import { PropertiesService } from './properties.service';
import type { PropertyUploadedFiles } from './properties.service';

@Controller('properties') //@Controller('properties') means every route in this class is prefixed with /properties.
@UseFilters(PropertyExceptionFilter)
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) { }

  @Post('create')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'propertyImage', maxCount: 1 },
      { name: 'propertyBroucher', maxCount: 1 },
    ]),
  )
  async create(
    @Body() body: CreatePropertyDto,
    @UploadedFiles() files: PropertyUploadedFiles,
    @Req() request,
  ) {
    const createdBy = request?.user?.user_id;
    const property = await this.propertiesService.create(body, files, createdBy);
    return this.response('Property created successfully.', property);
  }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'propertyImage', maxCount: 1 },
      { name: 'propertyBroucher', maxCount: 1 },
    ]),
  )
  async createDirect(
    @Body() dto: CreatePropertyDto,
    @UploadedFiles() files: PropertyUploadedFiles,
    @Req() request: AuthenticatedRequest,
  ) {
    const createdBy = request?.user?.user_id;
    const property = await this.propertiesService.create(dto, files, createdBy);
    return this.response('Property created successfully.', property);
  }

  @Post('update/:id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'propertyImage', maxCount: 1 },
      { name: 'propertyBroucher', maxCount: 1 },
    ]),
  )
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePropertyDto,
    @UploadedFiles() files: PropertyUploadedFiles,
  ) {
    const property = await this.propertiesService.update(id, dto, files);
    return this.response('Property updated successfully.', property);
  }

  @Post('delete/:id')
  async remove(@Param('id') id: string, @Body() dto: DeletePropertyDto) {
    const property = await this.propertiesService.remove(id, dto);
    return this.response('Property deleted successfully.', property);
  }

  @Get()
  async findAll(@Query() query: PaginationQueryDto) {
    const currentPage = Math.max(parseInt(query.currentPage ?? '1', 10) || 1, 1);
    const itemsPerPage = Math.max(parseInt(query.itemsPerPage ?? '10', 10) || 10, 1);
    const result = await this.propertiesService.findAll(currentPage, itemsPerPage);
    return { status: true, message: 'Properties retrieved successfully.', ...result };
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
