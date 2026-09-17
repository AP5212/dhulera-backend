import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { PropertyTpService } from './property_tp.service';
import { CreatePropertyTpDto } from './dto/create-property_tp.dto';
import { UpdatePropertyTpDto } from './dto/update-property_tp.dto';
import { QueryPropertyTpDto } from './dto/query-property_tp.dto';

@Controller('property-tp')
export class PropertyTpController {
  constructor(private readonly propertyTpService: PropertyTpService) { }

  @Post("create")
  async create(@Body() createPropertyTpDto: CreatePropertyTpDto) {
    const data = await this.propertyTpService.create(createPropertyTpDto);
    return this.response('Property TP created successfully.', data);
  }

  @Post('update/:id')
  async update(
    @Param('id') id: string,
    @Body() updatePropertyTpDto: UpdatePropertyTpDto,
  ) {
    const data = await this.propertyTpService.update(id, updatePropertyTpDto);
    return this.response('Property TP updated successfully.', data);
  }

  @Post('delete/:id')
  async remove(@Param('id') id: string) {
    const data = await this.propertyTpService.remove(id);
    return this.response('Property TP deleted successfully.', data);
  }

  @Get()
  async findAll(@Query() query: QueryPropertyTpDto) {
    const data = await this.propertyTpService.findAll(query);
    return this.response('Property TPs retrieved successfully.', data);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.propertyTpService.findOne(id);
    return this.response('Property TP retrieved successfully.', data);
  }

  private response(message: string, data: unknown) {
    return { status: true, message, data };
  }
}

