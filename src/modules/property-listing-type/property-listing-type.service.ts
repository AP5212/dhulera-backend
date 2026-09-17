import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { PropertyListingType } from './entities/property-listing-type.entity';
import { CreatePropertyListingTypeDto } from './dto/create-property-listing-type.dto';
import { UpdatePropertyListingTypeDto } from './dto/update-property-listing-type.dto';
import { QueryPropertyListingTypeDto } from './dto/query-property-listing-type.dto';

@Injectable()
export class PropertyListingTypeService {
  constructor(
    @InjectRepository(PropertyListingType)
    private readonly propertyListingTypeRepository: Repository<PropertyListingType>,
  ) { }

  async create(createPropertyListingTypeDto: CreatePropertyListingTypeDto): Promise<PropertyListingType> {
    const propertyListingType = this.propertyListingTypeRepository.create(createPropertyListingTypeDto);
    return await this.propertyListingTypeRepository.save(propertyListingType);
  }

  async findAll(query?: QueryPropertyListingTypeDto): Promise<PropertyListingType[]> {
    const where: FindOptionsWhere<PropertyListingType> = {};

    const isDeleteParam = query?.isDelete ?? query?.isDeleted;
    if (isDeleteParam !== undefined && isDeleteParam !== null && isDeleteParam !== '') {
      where.isDeleted =
        typeof isDeleteParam === 'boolean'
          ? isDeleteParam
          : String(isDeleteParam).toLowerCase() === 'true' || String(isDeleteParam) === '1';
    }

    if (query?.status) {
      where.status = query.status;
    }

    return await this.propertyListingTypeRepository.find({
      where: Object.keys(where).length > 0 ? where : undefined,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string | number): Promise<PropertyListingType> {
    const item = await this.propertyListingTypeRepository.findOne({
      where: { id: id.toString(), isDeleted: false },
    });
    if (!item) {
      throw new NotFoundException(`Property listing type with ID ${id} not found`);
    }
    return item;
  }

  async update(id: string | number, updatePropertyListingTypeDto: UpdatePropertyListingTypeDto): Promise<PropertyListingType> {
    const item = await this.findOne(id);
    const updated = this.propertyListingTypeRepository.merge(item, updatePropertyListingTypeDto);
    return await this.propertyListingTypeRepository.save(updated);
  }

  async remove(id: string | number): Promise<PropertyListingType> {
    const item = await this.findOne(id);
    item.isDeleted = true;
    return await this.propertyListingTypeRepository.save(item);
  }
}

