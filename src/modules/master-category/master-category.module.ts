import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterCategoryController } from './master-category.controller';
import { MasterCategory } from './entities/master-category.entity';
import { MasterCategoryService } from './master-category.service';

@Module({
  imports: [TypeOrmModule.forFeature([MasterCategory])],
  controllers: [MasterCategoryController],
  providers: [MasterCategoryService],
})
export class MasterCategoryModule {}
