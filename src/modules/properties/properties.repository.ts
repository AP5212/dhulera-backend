import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindManyOptions, Repository } from 'typeorm';
import { Property } from './entities/property.entity';
import { PropertyImage } from './entities/propertyImage.entity';

@Injectable()
export class PropertiesRepository {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,
    @InjectRepository(PropertyImage)
    private readonly propertyImageRepo: Repository<PropertyImage>,
  ) {}

  // ─── Property CRUD ─────────────────────────────────────────

  createEntity(data: DeepPartial<Property>): Property {
    return this.propertyRepo.create(data);
  }

  async save(property: Property): Promise<Property> {
    return this.propertyRepo.save(property);
  }

  async findAll(): Promise<Property[]> {
    return this.propertyRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findAndCount(options?: FindManyOptions<Property>): Promise<[Property[], number]> {
    return this.propertyRepo.findAndCount(options);
  }

  async findById(id: string): Promise<Property | null> {
    return this.propertyRepo.findOneBy({ id });
  }

  // ─── PropertyImage CRUD ────────────────────────────────────

  async saveImage(data: DeepPartial<PropertyImage>): Promise<PropertyImage> {
    const entity = this.propertyImageRepo.create(data);
    return this.propertyImageRepo.save(entity);
  }
}
