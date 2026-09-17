import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { PropertyTp } from './entities/property_tp.entity';
import { CreatePropertyTpDto } from './dto/create-property_tp.dto';
import { UpdatePropertyTpDto } from './dto/update-property_tp.dto';
import { QueryPropertyTpDto } from './dto/query-property_tp.dto';

@Injectable()
export class PropertyTpService {
  constructor(
    @InjectRepository(PropertyTp)
    private readonly propertyTpRepository: Repository<PropertyTp>,
  ) { }

  async create(createPropertyTpDto: CreatePropertyTpDto): Promise<PropertyTp> {
    const propertyTp = this.propertyTpRepository.create(createPropertyTpDto);
    return await this.propertyTpRepository.save(propertyTp);
  }

  async findAll(query?: QueryPropertyTpDto): Promise<PropertyTp[]> {
    const where: FindOptionsWhere<PropertyTp> = {};

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

    return await this.propertyTpRepository.find({
      where: Object.keys(where).length > 0 ? where : undefined,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string | number): Promise<PropertyTp> {
    const item = await this.propertyTpRepository.findOne({
      where: { id: id.toString(), isDeleted: false },
    });
    if (!item) {
      throw new NotFoundException(`Property TP with ID ${id} not found`);
    }
    return item;
  }

  async update(id: string | number, updatePropertyTpDto: UpdatePropertyTpDto): Promise<PropertyTp> {
    const item = await this.findOne(id);
    const updated = this.propertyTpRepository.merge(item, updatePropertyTpDto);
    return await this.propertyTpRepository.save(updated);
  }

  async remove(id: string | number): Promise<PropertyTp> {
    const item = await this.findOne(id);
    item.isDeleted = true;
    return await this.propertyTpRepository.save(item);
  }
}

