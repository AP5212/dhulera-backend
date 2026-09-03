import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthMiddleware } from '../users/middleware/jwt-auth.middleware';
import { UsersModule } from '../users/users.module';
import { District } from './entities/district.entity';
import { State } from './entities/state.entity';
import { SubDistrict } from './entities/sub-district.entity';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';

@Module({
  imports: [TypeOrmModule.forFeature([State, District, SubDistrict]), UsersModule],
  controllers: [LocationController],
  providers: [LocationService],
})
export class LocationModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(JwtAuthMiddleware).forRoutes(
      { path: 'location/states/create', method: RequestMethod.POST },
      { path: 'location/districts/create', method: RequestMethod.POST },
      { path: 'location/sub-districts/create', method: RequestMethod.POST },
    );
  }
}
