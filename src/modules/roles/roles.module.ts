import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthMiddleware } from '../users/middleware/jwt-auth.middleware';
import { UsersModule } from '../users/users.module';
import { Role } from './entities/role.entity';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

@Module({
  imports: [TypeOrmModule.forFeature([Role]), UsersModule],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(JwtAuthMiddleware).forRoutes({
      path: 'roles/create',
      method: RequestMethod.POST,
    });
  }
}
