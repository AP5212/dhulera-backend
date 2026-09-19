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

  // ─── Property Search ───────────────────────────────────────

  async searchProperties(params: {
    cityLocality?: string;
    propertyType?: string;
    budget?: string;
    minPrice?: number;
    maxPrice?: number;
    listingType?: string;
    category?: string;
    tp?: string;
    sir?: string;
    sortBy?: string;
    skip?: number;
    take?: number;
  }): Promise<[Property[], number]> {
    const qb = this.propertyRepo
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.images', 'images', 'images.status = :imgStatus', {
        imgStatus: 'ACTIVE',
      })
      .where('property.status != :deletedStatus', { deletedStatus: 'DELETED' })
      .andWhere('property.isActive = :isActive', { isActive: true });

    // 1. City / Locality
    if (params.cityLocality && params.cityLocality.trim()) {
      const term = `%${params.cityLocality.trim()}%`;
      qb.andWhere(
        '(property.propertyName ILIKE :locTerm OR property.propertyAddress ILIKE :locTerm OR property.propertyDescription ILIKE :locTerm OR property.propertyArea ILIKE :locTerm OR property.propertyTP ILIKE :locTerm OR property.propertySIR ILIKE :locTerm)',
        { locTerm: term },
      );
    }

    // 2. Property Type
    if (
      params.propertyType &&
      params.propertyType.trim() &&
      params.propertyType !== 'All' &&
      params.propertyType !== 'Select Property Type'
    ) {
      const pType = params.propertyType.trim();
      const pLower = pType.toLowerCase();
      if (pLower.includes('plot')) {
        qb.andWhere(
          '(property.propertyListingType ILIKE :ptTerm OR property.propertyName ILIKE :ptTerm OR property.propertyDescription ILIKE :ptTerm OR property.propertyArea ILIKE :ptTerm)',
          { ptTerm: '%plot%' },
        );
      } else if (pLower.includes('commercial')) {
        qb.andWhere(
          '(property.propertyListingType ILIKE :ptTerm OR property.propertyName ILIKE :ptTerm OR property.propertyDescription ILIKE :ptTerm)',
          { ptTerm: '%commercial%' },
        );
      } else if (pLower.includes('villa') || pLower.includes('house')) {
        qb.andWhere(
          '(property.propertyListingType ILIKE :ptTerm OR property.propertyName ILIKE :ptTerm OR property.propertyDescription ILIKE :ptTerm)',
          { ptTerm: '%villa%' },
        );
      } else if (pLower.includes('industrial')) {
        qb.andWhere(
          '(property.propertyListingType ILIKE :ptTerm OR property.propertyName ILIKE :ptTerm OR property.propertyDescription ILIKE :ptTerm)',
          { ptTerm: '%industrial%' },
        );
      } else if (pLower.includes('penthouse')) {
        qb.andWhere(
          '(property.propertyListingType ILIKE :ptTerm OR property.propertyName ILIKE :ptTerm OR property.propertyDescription ILIKE :ptTerm)',
          { ptTerm: '%penthouse%' },
        );
      } else if (pLower.includes('flat') || pLower.includes('apartment')) {
        qb.andWhere(
          '(property.propertyListingType ILIKE :flatTerm OR property.propertyName ILIKE :flatTerm OR property.propertyDescription ILIKE :flatTerm OR property.propertyListingType IS NULL)',
          { flatTerm: '%flat%' },
        );
      } else {
        qb.andWhere(
          '(property.propertyListingType ILIKE :ptTerm OR property.propertyName ILIKE :ptTerm OR property.propertyDescription ILIKE :ptTerm)',
          { ptTerm: `%${pType}%` },
        );
      }
    }

    // 3. Budget
    if (params.budget && params.budget !== 'Select Budget') {
      const b = params.budget.toLowerCase().trim();
      if (b.includes('under') && (b.includes('25') || b.includes('25l'))) {
        qb.andWhere('property.propertyMinPrice <= :maxBudget', { maxBudget: 2500000 });
      } else if (b.includes('25') && b.includes('50')) {
        qb.andWhere(
          'property.propertyMinPrice <= :maxBudget AND (property.propertyMaxPrice >= :minBudget OR property.propertyMinPrice >= :minBudget)',
          { minBudget: 2500000, maxBudget: 5000000 },
        );
      } else if (b.includes('50') && (b.includes('1cr') || b.includes('1 cr') || b.includes('100l'))) {
        qb.andWhere(
          'property.propertyMinPrice <= :maxBudget AND (property.propertyMaxPrice >= :minBudget OR property.propertyMinPrice >= :minBudget)',
          { minBudget: 5000000, maxBudget: 10000000 },
        );
      } else if (b.includes('1cr') && b.includes('3cr')) {
        qb.andWhere(
          'property.propertyMinPrice <= :maxBudget AND (property.propertyMaxPrice >= :minBudget OR property.propertyMinPrice >= :minBudget)',
          { minBudget: 10000000, maxBudget: 30000000 },
        );
      } else if (b.includes('3cr') && b.includes('5cr')) {
        qb.andWhere(
          'property.propertyMinPrice <= :maxBudget AND (property.propertyMaxPrice >= :minBudget OR property.propertyMinPrice >= :minBudget)',
          { minBudget: 30000000, maxBudget: 50000000 },
        );
      } else if (b.includes('above') && (b.includes('3cr') || b.includes('3 cr'))) {
        qb.andWhere(
          '(property.propertyMinPrice >= :minBudget OR property.propertyMaxPrice >= :minBudget)',
          { minBudget: 30000000 },
        );
      } else if (b.includes('above') && (b.includes('5cr') || b.includes('5 cr'))) {
        qb.andWhere(
          '(property.propertyMinPrice >= :minBudget OR property.propertyMaxPrice >= :minBudget)',
          { minBudget: 50000000 },
        );
      }
    }

    if (params.minPrice !== undefined && !isNaN(params.minPrice)) {
      qb.andWhere(
        '(property.propertyMinPrice >= :customMin OR property.propertyMaxPrice >= :customMin)',
        { customMin: params.minPrice },
      );
    }
    if (params.maxPrice !== undefined && !isNaN(params.maxPrice)) {
      qb.andWhere('property.propertyMinPrice <= :customMax', {
        customMax: params.maxPrice,
      });
    }

    // 4. Listing tab (Buy, Rent, Sell, Projects)
    if (params.listingType) {
      const lt = params.listingType.toLowerCase().trim();
      if (lt === 'rent') {
        qb.andWhere('property.propertyListingType ILIKE :ltRent', { ltRent: '%rent%' });
      } else if (lt === 'buy') {
        qb.andWhere(
          '(property.propertyListingType ILIKE :ltBuy OR property.propertyListingType ILIKE :ltSell OR property.propertyListingType IS NULL)',
          { ltBuy: '%buy%', ltSell: '%sell%' },
        );
      } else if (lt === 'projects') {
        qb.andWhere(
          '(property.propertyListingType ILIKE :ltProj OR property.propertyStatus ILIKE :ltConst OR property.propertyName ILIKE :ltProj)',
          { ltProj: '%project%', ltConst: '%construction%' },
        );
      }
    }

    // 5. Category Chips
    if (params.category && params.category !== 'all') {
      const cat = params.category.toLowerCase().trim();
      if (cat === 'inside-sir') {
        qb.andWhere('property.propertySIR ILIKE :sirInside', { sirInside: '%inside%' });
      } else if (cat === 'tp-1' || cat === 'tp1') {
        qb.andWhere(
          '(property.propertyTP ILIKE :tp1 OR property.propertyTP = :tpExact1)',
          { tp1: '%1%', tpExact1: '1' },
        );
      } else if (cat === 'tp-2' || cat === 'tp2') {
        qb.andWhere(
          '(property.propertyTP ILIKE :tp2 OR property.propertyTP = :tpExact2)',
          { tp2: '%2%', tpExact2: '2' },
        );
      } else if (cat === 'plots') {
        qb.andWhere(
          '(property.propertyArea ILIKE :plotArea OR property.propertyName ILIKE :plotName OR property.propertyDescription ILIKE :plotDesc OR property.propertyListingType ILIKE :plotLt)',
          {
            plotArea: '%sq yd%',
            plotName: '%plot%',
            plotDesc: '%plot%',
            plotLt: '%plot%',
          },
        );
      } else if (cat === 'commercial') {
        qb.andWhere(
          '(property.propertyListingType ILIKE :commLt OR property.propertyName ILIKE :commName OR property.propertyDescription ILIKE :commDesc)',
          {
            commLt: '%commercial%',
            commName: '%commercial%',
            commDesc: '%commercial%',
          },
        );
      } else if (cat === 'construction') {
        qb.andWhere('property.propertyStatus ILIKE :statusConst', {
          statusConst: '%construction%',
        });
      }
    }

    // TP and SIR direct parameters
    if (params.tp) {
      qb.andWhere('property.propertyTP ILIKE :tpDirect', {
        tpDirect: `%${params.tp}%`,
      });
    }
    if (params.sir) {
      qb.andWhere('property.propertySIR ILIKE :sirDirect', {
        sirDirect: `%${params.sir}%`,
      });
    }

    // 6. Sorting
    if (params.sortBy === 'price-asc') {
      qb.orderBy('property.propertyMinPrice', 'ASC', 'NULLS LAST');
    } else if (params.sortBy === 'price-desc') {
      qb.orderBy('property.propertyMaxPrice', 'DESC', 'NULLS LAST')
        .addOrderBy('property.propertyMinPrice', 'DESC', 'NULLS LAST');
    } else {
      qb.orderBy('property.createdAt', 'DESC');
    }

    qb.addOrderBy('images.createdAt', 'ASC');

    // 7. Pagination
    if (params.skip !== undefined) {
      qb.skip(params.skip);
    }
    if (params.take !== undefined) {
      qb.take(params.take);
    }

    return qb.getManyAndCount();
  }
}


