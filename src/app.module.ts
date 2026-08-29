import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import { AppController } from './app.controller';
import { UsersModule } from './modules/users/users.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { StaticContentModule } from './modules/static-content/static-content.module';
import { MasterCategoryModule } from './modules/master-category/master-category.module';
import { LocationModule } from './modules/location/location.module';
import { RolesModule } from './modules/roles/roles.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => require('./config/database.config').default(),
    }),
    UsersModule,
    PropertiesModule,
    SubscriptionsModule,
    StaticContentModule,
    MasterCategoryModule,
    LocationModule,
    RolesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
