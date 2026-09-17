import { Module } from '@nestjs/common';
import { PropertyTpService } from './property_tp.service';
import { PropertyTpController } from './property_tp.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyTp } from './entities/property_tp.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PropertyTp]),
  ],
  controllers: [PropertyTpController],
  providers: [PropertyTpService],
  exports: [PropertyTpService]
})
export class PropertyTpModule {}
