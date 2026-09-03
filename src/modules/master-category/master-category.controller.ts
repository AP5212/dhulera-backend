import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UnauthorizedException,
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

  @Post('create')
  async create(
    @Body() createMasterCategoryDto: CreateMasterCategoryDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<ApiResponse> {
    const data = await this.masterCategoryService.create(
      createMasterCategoryDto,
      this.getAuthenticatedUserId(request),
    );
    return this.successResponse('Master category created successfully.', data);
  }

  @Post('sub-category')
  async createSubCategory(
    @Body() createMasterCategoryDto: CreateMasterCategoryDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<ApiResponse> {
    const data = await this.masterCategoryService.createSubCategory(
      createMasterCategoryDto,
      this.getAuthenticatedUserId(request),
    );
    return this.successResponse('Subcategory created successfully.', data);
  }

  @Post('update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateMasterCategoryDto: UpdateMasterCategoryDto,
  ): Promise<ApiResponse> {
    const data = await this.masterCategoryService.update(id, updateMasterCategoryDto);
    return this.successResponse('Master category updated successfully.', data);
  }

  @Post('delete/:id')
  async remove(
    @Param('id') id: string,
    @Body() deleteMasterCategoryDto: DeleteMasterCategoryDto,
  ): Promise<ApiResponse> {
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

  private getAuthenticatedUserId(request: AuthenticatedRequest): string {
    const userId = request.user?.user_id;
    if (!userId) {
      throw new UnauthorizedException('Authenticated user information is missing.');
    }
    return userId;
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
