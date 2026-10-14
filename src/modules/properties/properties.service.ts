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
  propertyImages?: Express.Multer.File[];
  propertyBroucher?: Express.Multer.File[];
  propertyVideo?: Express.Multer.File[];
  propertyGifVideo?: Express.Multer.File[];
}

@Injectable()
export class PropertiesService {
  private readonly imagesDir = path.join(process.cwd(), 'assets', 'images');
  private readonly pdfDir = path.join(process.cwd(), 'assets', 'pdf');
  private readonly videosDir = path.join(process.cwd(), 'assets', 'videos');

  private readonly imageBaseUrl: string;

  constructor(
    private readonly propertiesRepository: PropertiesRepository,
    private readonly configService: ConfigService,
  ) {
    this.ensureDirectoryExists(this.imagesDir);
    this.ensureDirectoryExists(this.pdfDir);
    this.ensureDirectoryExists(this.videosDir);
    this.imageBaseUrl = this.configService.get<string>('app.imageBaseUrl') ?? 'http://localhost:8000';
  }

  // ─── CREATE ────────────────────────────────────────────────

  async create(
    dto: CreatePropertyDto,
    files?: PropertyUploadedFiles,
    createdBy?: string,
  ): Promise<Property> {
    const propertyName = this.requireText(dto.propertyName, 'propertyName');
    const propertyMinPrice = this.parseOptionalNumber(dto.propertyMinPrice, 'propertyMinPrice');
    const propertyMaxPrice = this.parseOptionalNumber(dto.propertyMaxPrice, 'propertyMaxPrice');
    const propertyAddress = this.optionalText(dto.propertyAddress);
    const propertyLattitude = this.optionalText(dto.propertyLattitude ?? dto.propertyLatitude);
    const propertyLongitude = this.optionalText(dto.propertyLongitude);
    const propertyStatus = this.optionalText(dto.propertyStatus) ?? 'AVAILABLE';
    const propertyDescription = this.optionalText(dto.propertyDescription);
    const propertyArea = this.optionalText(dto.propertyArea);
    const tpId = this.optionalText(dto.tpId);
    const sirId = this.optionalText(dto.sirId);
    const listingTypeId = this.optionalText(dto.listingTypeId);
    const propertyCreatedByType = this.optionalText(dto.propertyCreatedByType);
    const oldSurvey = this.optionalText(dto.oldSurvey);
    const newSurvey = this.optionalText(dto.newSurvey);
    const zone = this.optionalText(dto.zone);
    const roadWidth = this.optionalText(dto.roadWidth);

    // Handle brochure upload (single PDF file)
    const propertyBroucherUrl = await this.resolveFileUrl(
      files?.propertyBroucher?.[0],
      dto.propertyBroucher ?? dto.propertyBrochure,
      this.pdfDir,
      'pdf',
    );

    // Handle video upload (single video file)
    const propertyVideoUrl = await this.resolveFileUrl(
      files?.propertyVideo?.[0] ?? files?.propertyGifVideo?.[0],
      dto.propertyGifVideo ?? dto.propertyVideo,
      this.videosDir,
      'videos',
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
      tpId,
      sirId,
      listingTypeId,
      propertyCreatedByType,
      oldSurvey,
      newSurvey,
      zone,
      roadWidth,
      propertyBroucher: propertyBroucherUrl,
      propertyGifVideo: propertyVideoUrl,
      createdBy: createdBy ?? null,
    });

    const savedProperty = await this.propertiesRepository.save(entity);

    // Save each uploaded image as a separate PropertyImage row
    const imageFiles = [
      ...(files?.propertyImage ?? []),
      ...(files?.propertyImages ?? []),
    ];
    if (imageFiles.length > 0) {
      const imageRows = imageFiles.map((file) => ({
        propertyId: savedProperty.id,
        imageUrl: this.saveUploadedFile(file, this.imagesDir, 'images'),
        createdBy: createdBy ?? null,
      }));
      const savedImages = await this.propertiesRepository.saveImagesBulk(imageRows);
      savedProperty.images = savedImages;
    } else if (dto.propertyImages || dto.propertyImage) {
      const raw = dto.propertyImages ?? dto.propertyImage;
      const urls: string[] = Array.isArray(raw)
        ? raw
        : typeof raw === 'string' && raw.trim().startsWith('[')
          ? (() => { try { return JSON.parse(raw); } catch { return [raw]; } })()
          : typeof raw === 'string'
            ? raw.split(',').map((s) => s.trim()).filter(Boolean)
            : [];
      if (urls.length > 0) {
        const imageRows = urls.map((url) => ({
          propertyId: savedProperty.id,
          imageUrl: url,
          createdBy: createdBy ?? null,
        }));
        const savedImages = await this.propertiesRepository.saveImagesBulk(imageRows);
        savedProperty.images = savedImages;
      } else {
        savedProperty.images = [];
      }
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
    if (property.propertyBroucher && property.propertyBroucher.startsWith('/')) {
      property.propertyBroucher = `${this.imageBaseUrl}${property.propertyBroucher}`;
    }
    if (property.propertyGifVideo && property.propertyGifVideo.startsWith('/')) {
      property.propertyGifVideo = `${this.imageBaseUrl}${property.propertyGifVideo}`;
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

    if (dto.propertyName !== undefined) {
      property.propertyName = this.requireText(dto.propertyName, 'propertyName');
    }
    if (dto.propertyMinPrice !== undefined) {
      property.propertyMinPrice = this.parseOptionalNumber(dto.propertyMinPrice, 'propertyMinPrice');
    }
    if (dto.propertyMaxPrice !== undefined) {
      property.propertyMaxPrice = this.parseOptionalNumber(dto.propertyMaxPrice, 'propertyMaxPrice');
    }
    if (dto.propertyAddress !== undefined) {
      property.propertyAddress = this.optionalText(dto.propertyAddress);
    }
    if (dto.propertyLattitude !== undefined || dto.propertyLatitude !== undefined) {
      property.propertyLattitude = this.optionalText(dto.propertyLattitude ?? dto.propertyLatitude);
    }
    if (dto.propertyLongitude !== undefined) {
      property.propertyLongitude = this.optionalText(dto.propertyLongitude);
    }
    if (dto.propertyStatus !== undefined) {
      property.propertyStatus = this.optionalText(dto.propertyStatus) ?? property.propertyStatus;
    }
    if (dto.propertyDescription !== undefined) {
      property.propertyDescription = this.optionalText(dto.propertyDescription);
    }
    if (dto.propertyArea !== undefined) {
      property.propertyArea = this.optionalText(dto.propertyArea);
    }
    if (dto.tpId !== undefined) {
      property.tpId = this.optionalText(dto.tpId);
    }
    if (dto.sirId !== undefined) {
      property.sirId = this.optionalText(dto.sirId);
    }
    if (dto.listingTypeId !== undefined) {
      property.listingTypeId = this.optionalText(dto.listingTypeId);
    }
    if (dto.propertyCreatedByType !== undefined) {
      property.propertyCreatedByType = this.optionalText(dto.propertyCreatedByType);
    }
    if (dto.oldSurvey !== undefined) {
      property.oldSurvey = this.optionalText(dto.oldSurvey);
    }
    if (dto.newSurvey !== undefined) {
      property.newSurvey = this.optionalText(dto.newSurvey);
    }
    if (dto.zone !== undefined) {
      property.zone = this.optionalText(dto.zone);
    }
    if (dto.roadWidth !== undefined) {
      property.roadWidth = this.optionalText(dto.roadWidth);
    }

    const brochureUrl = await this.resolveFileUrl(
      files?.propertyBroucher?.[0],
      dto.propertyBroucher ?? dto.propertyBrochure,
      this.pdfDir,
      'pdf',
    );
    if (brochureUrl !== null) {
      property.propertyBroucher = brochureUrl;
    }

    // Handle video upload
    const videoUrl = await this.resolveFileUrl(
      files?.propertyVideo?.[0] ?? files?.propertyGifVideo?.[0],
      dto.propertyGifVideo ?? dto.propertyVideo,
      this.videosDir,
      'videos',
    );
    if (videoUrl !== null) {
      property.propertyGifVideo = videoUrl;
    }

    // updatedBy from JWT token, not request body
    property.updatedBy = updatedBy ?? null;

    const savedProperty = await this.propertiesRepository.save(property);

    const imageFiles = [
      ...(files?.propertyImage ?? []),
      ...(files?.propertyImages ?? []),
    ];
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

  async remove(id: string, dto?: DeletePropertyDto, updatedBy?: string): Promise<Property> {
    const property = await this.findExisting(id);
    property.updatedBy = updatedBy ?? dto?.updatedBy ?? null;
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
