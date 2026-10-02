import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseFilters,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../users/middleware/jwt-auth.middleware';
import { CreateMasterCategoryDto } from './dto/create-master-category.dto';
import { DeleteMasterCategoryDto } from './dto/delete-master-category.dto';
import { UpdateMasterCategoryDto } from './dto/update-master-category.dto';
import { MasterCategory } from './entities/master-category.entity';
import { MasterCategoryExceptionFilter } from './filters/master-category-exception.filter';
import { MasterCategoryService } from './master-category.service';

@Controller('master-category')
@UseFilters(MasterCategoryExceptionFilter)
export class MasterCategoryController {
  constructor(private readonly masterCategoryService: MasterCategoryService) {}

  @Post()
  async createRoot(
    @Body() createMasterCategoryDto: CreateMasterCategoryDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<ApiResponse> {
    const userId = this.resolveUserId(createMasterCategoryDto.createdBy, request);
    const data = await this.masterCategoryService.create(createMasterCategoryDto, userId);
    return this.successResponse('Master category created successfully.', data);
  }

  @Post('create')
  async create(
    @Body() createMasterCategoryDto: CreateMasterCategoryDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<ApiResponse> {
    const userId = this.resolveUserId(createMasterCategoryDto.createdBy, request);
    const data = await this.masterCategoryService.create(createMasterCategoryDto, userId);
    return this.successResponse('Master category created successfully.', data);
  }

  @Post('sub-category')
  async createSubCategory(
    @Body() createMasterCategoryDto: CreateMasterCategoryDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<ApiResponse> {
    const userId = this.resolveUserId(createMasterCategoryDto.createdBy, request);
    const data = await this.masterCategoryService.createSubCategory(createMasterCategoryDto, userId);
    return this.successResponse('Subcategory created successfully.', data);
  }

  @Post('update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateMasterCategoryDto: UpdateMasterCategoryDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<ApiResponse> {
    if (!updateMasterCategoryDto.updatedBy) {
      updateMasterCategoryDto.updatedBy = this.resolveUserId(undefined, request);
    }
    const data = await this.masterCategoryService.update(id, updateMasterCategoryDto);
    return this.successResponse('Master category updated successfully.', data);
  }

  @Post('delete/:id')
  async remove(
    @Param('id') id: string,
    @Body() deleteMasterCategoryDto: DeleteMasterCategoryDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<ApiResponse> {
    if (!deleteMasterCategoryDto.updatedBy) {
      deleteMasterCategoryDto.updatedBy = this.resolveUserId(undefined, request);
    }
    const data = await this.masterCategoryService.remove(id, deleteMasterCategoryDto);
    return this.successResponse('Master category deleted successfully.', data);
  }

  @Get()
  async findAll(@Query('parentId') parentId?: string): Promise<ApiListResponse> {
    const data = await this.masterCategoryService.findAll(parentId);
    return { status: true, message: 'Master categories retrieved successfully.', data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse> {
    const data = await this.masterCategoryService.findOne(id);
    return this.successResponse('Master category retrieved successfully.', data);
  }

  private successResponse(message: string, data: MasterCategory): ApiResponse {
    return { status: true, message, data };
  }

  private resolveUserId(explicitUserId?: string, request?: AuthenticatedRequest): string {
    if (explicitUserId && /^\d+$/.test(explicitUserId)) {
      return explicitUserId;
    }
    const userFromReq = request?.user?.user_id || request?.user?.id || request?.user?.sub;
    if (userFromReq && /^\d+$/.test(String(userFromReq))) {
      return String(userFromReq);
    }
    return '1';
  }
}

interface ApiResponse {
  status: true;
  message: string;
  data: MasterCategory;
}

interface ApiListResponse {
  status: true;
  message: string;
  data: MasterCategory[];
}
