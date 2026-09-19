import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { CreatePropertyDto } from './dto/create-property.dto';
import { DeletePropertyDto } from './dto/delete-property.dto';
import { SearchPropertyDto } from './dto/search-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { Property } from './entities/property.entity';
import { PropertiesRepository } from './properties.repository';

export interface PropertyUploadedFiles {
  propertyImage?: Express.Multer.File[];
  propertyBroucher?: Express.Multer.File[];
}

@Injectable()
export class PropertiesService {
  private readonly imagesDir = path.join(process.cwd(), 'assets', 'images');
  private readonly pdfDir = path.join(process.cwd(), 'assets', 'pdf');

  private readonly imageBaseUrl: string;

  constructor(
    private readonly propertiesRepository: PropertiesRepository,
    private readonly configService: ConfigService,
  ) {
    this.ensureDirectoryExists(this.imagesDir);
    this.ensureDirectoryExists(this.pdfDir);
    this.imageBaseUrl = this.configService.get<string>('app.imageBaseUrl') ?? 'http://localhost:3000';
  }

  // ─── CREATE ────────────────────────────────────────────────

  async create(
    dto: CreatePropertyDto,
    files?: PropertyUploadedFiles,
    createdBy?: string,
  ): Promise<Property> {
    const propertyName = this.requireText(dto.propertyName ?? dto.properyName ?? dto.property_name, 'propertyName');
    const propertyMinPrice = this.parseOptionalNumber(dto.propertyMinPrice ?? dto.properytMinPrice ?? dto.property_min_price, 'propertyMinPrice');
    const propertyMaxPrice = this.parseOptionalNumber(dto.propertyMaxPrice ?? dto.property_max_price, 'propertyMaxPrice');
    const propertyAddress = this.optionalText(dto.propertyAddress ?? dto.property_address);
    const propertyLattitude = this.optionalText(dto.propertyLattitude ?? dto.propertyLatitude ?? dto.property_lattitude ?? dto.property_latitude);
    const propertyLongitude = this.optionalText(dto.propertyLongitude ?? dto.property_longitude);
    const propertyStatus = this.optionalText(dto.propertyStatus ?? dto.property_status) ?? 'AVAILABLE';
    const propertyDescription = this.optionalText(dto.propertyDescription ?? dto.property_description);
    const propertyArea = this.optionalText(dto.propertyArea ?? dto.property_area);
    const propertyTP = this.optionalText(dto.propertyTP ?? dto.property_tp);
    const propertySIR = this.optionalText(dto.propertySIR ?? dto.property_sir);
    const propertyListingType = this.optionalText(dto.propertyListingType ?? dto.property_listing_type);

    // Handle brochure upload (single file)
    const propertyBroucherUrl = await this.resolveFileUrl(
      files?.propertyBroucher?.[0],
      dto.propertyBroucher ?? dto.propertyBrochure ?? dto.property_broucher,
      this.pdfDir,
      'pdf',
    );

    // Save property first — we need its id as FK for image rows
    const entity = this.propertiesRepository.createEntity({
      propertyName,
      propertyMinPrice,
      propertyMaxPrice,
      propertyAddress,
      propertyLattitude,
      propertyLongitude,
      propertyStatus,
      propertyDescription,
      propertyArea,
      propertyTP,
      propertySIR,
      propertyListingType,
      propertyBroucher: propertyBroucherUrl,
      createdBy: createdBy ?? null,
    });

    const savedProperty = await this.propertiesRepository.save(entity);

    // Save each uploaded image as a separate PropertyImage row
    const imageFiles = files?.propertyImage ?? [];
    if (imageFiles.length > 0) {
      const imageRows = imageFiles.map((file) => ({
        propertyId: savedProperty.id,
        imageUrl: this.saveUploadedFile(file, this.imagesDir, 'images'),
        createdBy: createdBy ?? null,
      }));
      const savedImages = await this.propertiesRepository.saveImagesBulk(imageRows);
      savedProperty.images = savedImages;
    } else {
      savedProperty.images = [];
    }

    return this.attachBaseUrl(savedProperty);
  }

  // ─── SEARCH ────────────────────────────────────────────────

  async search(dto: SearchPropertyDto): Promise<{
    status: boolean;
    message: string;
    data: Property[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  }> {
    const cityLocality = this.optionalText(
      dto.search_city_locality ?? dto.locality ?? dto.city ?? dto.q,
    );
    const propertyType = this.optionalText(
      dto.search_property_type ?? dto.property_type ?? dto.propertyType,
    );
    const budget = this.optionalText(
      dto.search_property_budget ?? dto.budget ?? dto.property_budget,
    );
    const listingType = this.optionalText(
      dto.search_listing_type ?? dto.listing_type ?? dto.type,
    );
    const category = this.optionalText(dto.category ?? dto.selectedChip);
    const tp = this.optionalText(dto.property_tp ?? dto.propertyTP);
    const sir = this.optionalText(dto.property_sir ?? dto.propertySIR);
    const sortBy = this.optionalText(dto.sortBy ?? dto.sort_by) ?? 'recommended';

    const minPrice = dto.minPrice ? Number(dto.minPrice) : undefined;
    const maxPrice = dto.maxPrice ? Number(dto.maxPrice) : undefined;

    const currentPage = Math.max(
      parseInt(dto.currentPage ?? dto.page ?? '1', 10) || 1,
      1,
    );
    const itemsPerPage = Math.max(
      parseInt(dto.itemsPerPage ?? dto.limit ?? '20', 10) || 20,
      1,
    );
    const skip = (currentPage - 1) * itemsPerPage;

    const [properties, totalItems] =
      await this.propertiesRepository.searchProperties({
        cityLocality: cityLocality ?? undefined,
        propertyType: propertyType ?? undefined,
        budget: budget ?? undefined,
        minPrice,
        maxPrice,
        listingType: listingType ?? undefined,
        category: category ?? undefined,
        tp: tp ?? undefined,
        sir: sir ?? undefined,
        sortBy,
        skip,
        take: itemsPerPage,
      });

    const data = properties.map((property) => this.attachBaseUrl(property));
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 0;
    const message =
      data.length > 0
        ? 'Properties retrieved successfully.'
        : 'Data not found';

    return {
      status: true,
      message,
      data,
      totalItems,
      totalPages,
      currentPage,
      itemsPerPage,
    };
  }

  // ─── READ ──────────────────────────────────────────────────

  async findAll(
    currentPage = 1,
    itemsPerPage = 10,
  ): Promise<{
    data: Property[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  }> {
    const skip = (currentPage - 1) * itemsPerPage;
    const [properties, totalItems] = await this.propertiesRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip,
      take: itemsPerPage,
    });
    const data = properties.map((property) => this.attachBaseUrl(property));
    return { data, totalItems, totalPages: Math.ceil(totalItems / itemsPerPage), currentPage, itemsPerPage };
  }

  async findOne(id: string): Promise<Property> {
    const property = await this.findExisting(id);
    return this.attachBaseUrl(property);
  }

  private attachBaseUrl(property: Property): Property {
    if (property.propertyImage && property.propertyImage.startsWith('/')) {
      property.propertyImage = `${this.imageBaseUrl}${property.propertyImage}`;
    }
    if (property.propertyBroucher && property.propertyBroucher.startsWith('/')) {
      property.propertyBroucher = `${this.imageBaseUrl}${property.propertyBroucher}`;
    }
    if (Array.isArray(property.images)) {
      property.images = property.images.map((img) => {
        if (img.imageUrl && img.imageUrl.startsWith('/')) {
          img.imageUrl = `${this.imageBaseUrl}${img.imageUrl}`;
        }
        return img;
      });
    }
    return property;
  }

  // ─── UPDATE ────────────────────────────────────────────────

  async update(
    id: string,
    dto: UpdatePropertyDto,
    files?: PropertyUploadedFiles,
    updatedBy?: string,
  ): Promise<Property> {
    const property = await this.findExisting(id);

    const propertyName = dto.propertyName ?? dto.properyName ?? dto.property_name;
    if (propertyName !== undefined) {
      property.propertyName = this.requireText(propertyName, 'propertyName');
    }
    const minPrice = dto.propertyMinPrice ?? dto.properytMinPrice ?? dto.property_min_price;
    if (minPrice !== undefined) {
      property.propertyMinPrice = this.parseOptionalNumber(minPrice, 'propertyMinPrice');
    }
    const maxPrice = dto.propertyMaxPrice ?? dto.property_max_price;
    if (maxPrice !== undefined) {
      property.propertyMaxPrice = this.parseOptionalNumber(maxPrice, 'propertyMaxPrice');
    }
    const address = dto.propertyAddress ?? dto.property_address;
    if (address !== undefined) {
      property.propertyAddress = this.optionalText(address);
    }
    const latitude = dto.propertyLattitude ?? dto.propertyLatitude ?? dto.property_lattitude ?? dto.property_latitude;
    if (latitude !== undefined) {
      property.propertyLattitude = this.optionalText(latitude);
    }
    const longitude = dto.propertyLongitude ?? dto.property_longitude;
    if (longitude !== undefined) {
      property.propertyLongitude = this.optionalText(longitude);
    }
    const status = dto.propertyStatus ?? dto.property_status;
    if (status !== undefined) {
      property.propertyStatus = this.optionalText(status) ?? property.propertyStatus;
    }
    const description = dto.propertyDescription ?? dto.property_description;
    if (description !== undefined) {
      property.propertyDescription = this.optionalText(description);
    }
    const area = dto.propertyArea ?? dto.property_area;
    if (area !== undefined) {
      property.propertyArea = this.optionalText(area);
    }
    const tp = dto.propertyTP ?? dto.property_tp;
    if (tp !== undefined) {
      property.propertyTP = this.optionalText(tp);
    }
    const sir = dto.propertySIR ?? dto.property_sir;
    if (sir !== undefined) {
      property.propertySIR = this.optionalText(sir);
    }
    const listingType = dto.propertyListingType ?? dto.property_listing_type;
    if (listingType !== undefined) {
      property.propertyListingType = this.optionalText(listingType);
    }

    const brochureUrl = await this.resolveFileUrl(
      files?.propertyBroucher?.[0],
      dto.propertyBroucher ?? dto.propertyBrochure ?? dto.property_broucher,
      this.pdfDir,
      'pdf',
    );
    if (brochureUrl !== null) {
      property.propertyBroucher = brochureUrl;
    }

    // updatedBy from JWT token, not request body
    property.updatedBy = updatedBy ?? null;

    const savedProperty = await this.propertiesRepository.save(property);

    const imageFiles = files?.propertyImage ?? [];
    if (imageFiles.length > 0) {
      const imageRows = imageFiles.map((file) => ({
        propertyId: savedProperty.id,
        imageUrl: this.saveUploadedFile(file, this.imagesDir, 'images'),
        createdBy: updatedBy ?? null,
      }));
      await this.propertiesRepository.saveImagesBulk(imageRows);
    }

    return this.findOne(savedProperty.id);
  }

  // ─── DELETE (soft) ─────────────────────────────────────────

  async remove(id: string, dto?: DeletePropertyDto): Promise<Property> {
    const property = await this.findExisting(id);
    if (dto?.updatedBy) {
      property.updatedBy = dto.updatedBy;
    }
    property.propertyStatus = 'DELETED';
    return this.propertiesRepository.save(property);
  }

  // ─── Private helpers ──────────────────────────────────────

  private async findExisting(id: string): Promise<Property> {
    if (!id || !/^\d+$/.test(id)) {
      throw new BadRequestException('Invalid property id.');
    }
    const property = await this.propertiesRepository.findById(id);
    if (!property) {
      throw new NotFoundException(`Property with id '${id}' was not found.`);
    }
    return property;
  }

  private async resolveFileUrl(
    file: Express.Multer.File | undefined,
    dtoValue: unknown,
    targetDir: string,
    folderName: string,
  ): Promise<string | null> {
    if (file) {
      return this.saveUploadedFile(file, targetDir, folderName);
    }
    return this.optionalText(dtoValue);
  }

  private requireText(value: unknown, fieldName: string): string {
    if (typeof value !== 'string' || !value.trim()) {
      throw new BadRequestException(`${fieldName} is required and must be a non-empty string.`);
    }
    return value.trim();
  }

  private optionalText(value: unknown): string | null {
    if (value === undefined || value === null) return null;
    const str = String(value).trim();
    return str.length > 0 ? str : null;
  }

  private parseOptionalNumber(value: unknown, fieldName: string): number | null {
    if (value === undefined || value === null || value === '') return null;
    const num = Number(value);
    if (isNaN(num)) throw new BadRequestException(`${fieldName} must be a valid number.`);
    return num;
  }

  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  private saveUploadedFile(file: Express.Multer.File, targetDir: string, folderName: string): string {
    this.ensureDirectoryExists(targetDir);
    const ext = path.extname(file.originalname) || '';
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueName = `${baseName}_${Date.now()}_${Math.floor(Math.random() * 10000)}${ext}`;
    const destinationPath = path.join(targetDir, uniqueName);
    if (file.buffer) {
      fs.writeFileSync(destinationPath, file.buffer);
    } else if (file.path) {
      fs.copyFileSync(file.path, destinationPath);
    }
    return `/assets/${folderName}/${uniqueName}`;
  }
}
