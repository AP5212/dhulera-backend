import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { District } from './entities/district.entity';
import { State } from './entities/state.entity';
import { SubDistrict } from './entities/sub-district.entity';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';

@Module({
  imports: [TypeOrmModule.forFeature([State, District, SubDistrict])],
  controllers: [LocationController],
  providers: [LocationService],
})
export class LocationModule {}
