import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtAuthMiddleware } from './middleware/jwt-auth.middleware';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '22m' },
      }),
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtAuthMiddleware],
  exports: [TypeOrmModule, JwtModule, UsersService, JwtAuthMiddleware],
})
export class UsersModule {}
