import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthMiddleware } from '../users/middleware/jwt-auth.middleware';
import { UsersModule } from '../users/users.module';
import { Property } from './entities/property.entity';
import { PropertyImage } from './entities/propertyImage.entity';
import { PropertiesController } from './properties.controller';
import { PropertiesRepository } from './properties.repository';
import { PropertiesService } from './properties.service';

@Module({
  imports: [TypeOrmModule.forFeature([Property, PropertyImage]), UsersModule],
  controllers: [PropertiesController],
  providers: [PropertiesService, PropertiesRepository],
  exports: [PropertiesService, PropertiesRepository, TypeOrmModule],
})
export class PropertiesModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Apply JWT middleware to all properties routes so request.user is populated
    // from the token when provided. Anonymous requests still pass through (middleware is soft).
    consumer
      .apply(JwtAuthMiddleware)
      .forRoutes({ path: 'properties/*', method: RequestMethod.ALL });
  }
}