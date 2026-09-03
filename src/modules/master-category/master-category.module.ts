import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthMiddleware } from '../users/middleware/jwt-auth.middleware';
import { UsersModule } from '../users/users.module';
import { MasterCategoryController } from './master-category.controller';
import { MasterCategory } from './entities/master-category.entity';
import { MasterCategoryService } from './master-category.service';

@Module({
  imports: [TypeOrmModule.forFeature([MasterCategory]), UsersModule],
  controllers: [MasterCategoryController],
  providers: [MasterCategoryService],
})
export class MasterCategoryModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(JwtAuthMiddleware).forRoutes(
      { path: 'master-category/create', method: RequestMethod.POST },
      { path: 'master-category/sub-category', method: RequestMethod.POST },
    );
  }
}
