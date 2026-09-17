import { Module } from '@nestjs/common';
import { PropertyListingTypeService } from './property-listing-type.service';
import { PropertyListingTypeController } from './property-listing-type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyListingType } from './entities/property-listing-type.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([PropertyListingType]),
  ],
  controllers: [PropertyListingTypeController],
  providers: [PropertyListingTypeService],
  exports: [PropertyListingTypeService],
})
export class PropertyListingTypeModule {}
