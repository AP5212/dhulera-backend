import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseFilters,
} from '@nestjs/common';
import {
  CreateDistrictDto,
  CreateStateDto,
  CreateSubDistrictDto,
  DeleteLocationDto,
  UpdateDistrictDto,
  UpdateStateDto,
  UpdateSubDistrictDto,
} from './dto/location.dto';
import { LocationExceptionFilter } from './filters/location-exception.filter';
import { LocationService } from './location.service';

@Controller('location')
@UseFilters(LocationExceptionFilter)
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post('states/create') createState(@Body() dto: CreateStateDto) {
    return this.locationService
      .createState(dto)
      .then((data) => this.response('State created successfully.', data));
  }
  @Post('states/update/:id') updateState(
    @Param('id') id: string,
    @Body() dto: UpdateStateDto,
  ) {
    return this.locationService
      .updateState(id, dto)
      .then((data) => this.response('State updated successfully.', data));
  }
  @Post('states/delete/:id') deleteState(
    @Param('id') id: string,
    @Body() dto: DeleteLocationDto,
  ) {
    return this.locationService
      .deleteState(id, dto)
      .then((data) => this.response('State deleted successfully.', data));
  }
  @Get('states') findStates() {
    return this.locationService
      .findStates()
      .then((data) => this.response('States retrieved successfully.', data));
  }
  @Get('states/:id') findState(@Param('id') id: string) {
    return this.locationService
      .findState(id)
      .then((data) => this.response('State retrieved successfully.', data));
  }

  @Post('districts/create') createDistrict(@Body() dto: CreateDistrictDto) {
    return this.locationService
      .createDistrict(dto)
      .then((data) => this.response('District created successfully.', data));
  }
  @Post('districts/update/:id') updateDistrict(
    @Param('id') id: string,
    @Body() dto: UpdateDistrictDto,
  ) {
    return this.locationService
      .updateDistrict(id, dto)
      .then((data) => this.response('District updated successfully.', data));
  }
  @Post('districts/delete/:id') deleteDistrict(
    @Param('id') id: string,
    @Body() dto: DeleteLocationDto,
  ) {
    return this.locationService
      .deleteDistrict(id, dto)
      .then((data) => this.response('District deleted successfully.', data));
  }
  @Get('districts') findDistricts(@Query('stateId') stateId?: string) {
    return this.locationService
      .findDistricts(stateId)
      .then((data) => this.response('Districts retrieved successfully.', data));
  }
  @Get('districts/:id') findDistrict(@Param('id') id: string) {
    return this.locationService
      .findDistrict(id)
      .then((data) => this.response('District retrieved successfully.', data));
  }

  @Post('sub-districts/create') createSubDistrict(
    @Body() dto: CreateSubDistrictDto,
  ) {
    return this.locationService
      .createSubDistrict(dto)
      .then((data) =>
        this.response('Sub-district created successfully.', data),
      );
  }
  @Post('sub-districts/update/:id') updateSubDistrict(
    @Param('id') id: string,
    @Body() dto: UpdateSubDistrictDto,
  ) {
    return this.locationService
      .updateSubDistrict(id, dto)
      .then((data) =>
        this.response('Sub-district updated successfully.', data),
      );
  }
  @Post('sub-districts/delete/:id') deleteSubDistrict(
    @Param('id') id: string,
    @Body() dto: DeleteLocationDto,
  ) {
    return this.locationService
      .deleteSubDistrict(id, dto)
      .then((data) =>
        this.response('Sub-district deleted successfully.', data),
      );
  }
  @Get('sub-districts') findSubDistricts(
    @Query('districtId') districtId?: string,
  ) {
    return this.locationService
      .findSubDistricts(districtId)
      .then((data) =>
        this.response('Sub-districts retrieved successfully.', data),
      );
  }
  @Get('sub-districts/:id') findSubDistrict(@Param('id') id: string) {
    return this.locationService
      .findSubDistrict(id)
      .then((data) =>
        this.response('Sub-district retrieved successfully.', data),
      );
  }

  private response(message: string, data: unknown) {
    return { status: true, message, data };
  }
}
