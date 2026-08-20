import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaticContentController } from './static-content.controller';
import { StaticContent } from './entities/static-content.entity';
import { StaticContentService } from './static-content.service';

@Module({
  imports: [TypeOrmModule.forFeature([StaticContent])],
  controllers: [StaticContentController],
  providers: [StaticContentService],
})
export class StaticContentModule {}
