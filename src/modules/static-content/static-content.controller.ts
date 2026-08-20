import { Body, Controller, Get, Param, Post, UseFilters } from '@nestjs/common';
import { CreateStaticContentDto } from './dto/create-static-content.dto';
import { DeleteStaticContentDto } from './dto/delete-static-content.dto';
import { UpdateStaticContentDto } from './dto/update-static-content.dto';
import { StaticContent } from './entities/static-content.entity';
import { StaticContentExceptionFilter } from './filters/static-content-exception.filter';
import { StaticContentService } from './static-content.service';

@Controller('static-content')
@UseFilters(StaticContentExceptionFilter)
export class StaticContentController {
  constructor(private readonly staticContentService: StaticContentService) {}

  @Post('create')
  async create(@Body() createStaticContentDto: CreateStaticContentDto): Promise<ApiResponse> {
    const data = await this.staticContentService.create(createStaticContentDto);
    return this.successResponse('Static content created successfully.', data);
  }

  @Post('update/:id')
  update(
    @Param('id') id: string,
    @Body() updateStaticContentDto: UpdateStaticContentDto,
  ): Promise<ApiResponse> {
    return this.staticContentService
      .update(id, updateStaticContentDto)
      .then((data) => this.successResponse('Static content updated successfully.', data));
  }

  @Post('delete/:id')
  remove(
    @Param('id') id: string,
    @Body() deleteStaticContentDto: DeleteStaticContentDto,
  ): Promise<ApiResponse> {
    return this.staticContentService
      .remove(id, deleteStaticContentDto)
      .then((data) => this.successResponse('Static content deleted successfully.', data));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse> {
    const data = await this.staticContentService.findOne(id);
    return this.successResponse('Static content retrieved successfully.', data);
  }

  private successResponse(message: string, data: StaticContent): ApiResponse {
    return { status: true, message, data };
  }
}

interface ApiResponse {
  status: true;
  message: string;
  data: StaticContent;
}
