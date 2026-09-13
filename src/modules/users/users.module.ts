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
        secret:
          configService.get<string>('jwt.secret') ||
          configService.get<string>('JWT_SECRET') ||
          'dhulera-jwt-secret-key-change-in-production',
        signOptions: {
          expiresIn: (configService.get<string>('jwt.expiresIn') ||
            configService.get<string>('JWT_EXPIRES_IN') ||
            '7d') as any,
        },
      }),
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtAuthMiddleware],
  exports: [TypeOrmModule, JwtModule, UsersService, JwtAuthMiddleware],
})
export class UsersModule {}
