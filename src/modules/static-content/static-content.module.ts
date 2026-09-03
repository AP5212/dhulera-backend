import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthMiddleware } from '../users/middleware/jwt-auth.middleware';
import { UsersModule } from '../users/users.module';
import { StaticContentController } from './static-content.controller';
import { StaticContent } from './entities/static-content.entity';
import { StaticContentService } from './static-content.service';

@Module({
  imports: [TypeOrmModule.forFeature([StaticContent]), UsersModule],
  controllers: [StaticContentController],
  providers: [StaticContentService],
})
export class StaticContentModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(JwtAuthMiddleware).forRoutes({
      path: 'static-content/create',
      method: RequestMethod.POST,
    });
  }
}
