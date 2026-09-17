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

  /**
   * Finds a property by id and LEFT JOINs its images.
   * Images are ordered oldest-first for consistent display.
   */
  async findById(id: string): Promise<Property | null> {
    return this.propertyRepo
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.images', 'images', 'images.status = :status', {
        status: 'ACTIVE',
      })
      .where('property.id = :id', { id })
      .orderBy('images.createdAt', 'ASC')
      .getOne();
  }

  // ─── PropertyImage CRUD ────────────────────────────────────

  /**
   * Bulk-saves multiple PropertyImage rows in a single transaction.
   * Used after creating a property to persist all uploaded images.
   */
  async saveImagesBulk(images: DeepPartial<PropertyImage>[]): Promise<PropertyImage[]> {
    const entities = images.map((img) => this.propertyImageRepo.create(img));
    return this.propertyImageRepo.save(entities);
  }

  /** @deprecated Use saveImagesBulk for multi-image support */
  async saveImage(data: DeepPartial<PropertyImage>): Promise<PropertyImage> {
    const entity = this.propertyImageRepo.create(data);
    return this.propertyImageRepo.save(entity);
  }
}

