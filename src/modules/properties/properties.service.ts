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
    // 1. Validate & sanitise DTO fields (service responsibility)
    const propertyName = this.requireText(
      dto.propertyName ?? dto.properyName,
      'propertyName',
    );
    const propertyMinPrice = this.parseOptionalNumber(
      dto.propertyMinPrice ?? dto.properytMinPrice,
      'propertyMinPrice',
    );
    const propertyMaxPrice = this.parseOptionalNumber(
      dto.propertyMaxPrice,
      'propertyMaxPrice',
    );
    const propertyAddress = this.optionalText(dto.propertyAddress);
    const propertyLattitude = this.optionalText(
      dto.propertyLattitude ?? dto.propertyLatitude,
    );
    const propertyLongitude = this.optionalText(dto.propertyLongitude);
    const propertyStatus = this.optionalText(dto.propertyStatus) ?? 'AVAILABLE';
    const propertyDescription = this.optionalText(dto.propertyDescription);
    const propertyArea = this.optionalText(dto.propertyArea);
    const propertyTP = this.optionalText(dto.propertyTP);
    const propertySIR = this.optionalText(dto.propertySIR);
    const propertyListingType = this.optionalText(dto.propertyListingType);

    // 2. Handle file uploads in parallel → get back the asset URLs (service responsibility)
    const [propertyImageUrl, propertyBroucherUrl] = await Promise.all([
      this.resolveFileUrl(
        files?.propertyImage?.[0],
        dto.propertyImage,
        this.imagesDir,
        'images',
      ),
      this.resolveFileUrl(
        files?.propertyBroucher?.[0] ?? files?.propertyBroucher?.[0],
        dto.propertyBroucher ?? dto.propertyBroucher,
        this.pdfDir,
        'pdf',
      ),
    ]);

    // 3. Build entity & persist (repository responsibility)
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
      propertyImage: propertyImageUrl,
      propertyTP,
      propertySIR,
      propertyListingType,
      propertyBroucher: propertyBroucherUrl,
      createdBy: createdBy ?? null,
    });

    return this.propertiesRepository.save(entity);
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

    return {
      data,
      totalItems,
      totalPages: Math.ceil(totalItems / itemsPerPage),
      currentPage,
      itemsPerPage,
    };
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
    return property;
  }

  // ─── UPDATE ────────────────────────────────────────────────

  async update(
    id: string,
    dto: UpdatePropertyDto,
    files?: PropertyUploadedFiles,
  ): Promise<Property> {
    const property = await this.findExisting(id);

    // Validate & patch each field only when the caller sent it
    const propertyName = dto.propertyName ?? dto.properyName;
    if (propertyName !== undefined) {
      property.propertyName = this.requireText(propertyName, 'propertyName');
    }

    const minPrice = dto.propertyMinPrice ?? dto.properytMinPrice;
    if (minPrice !== undefined) {
      property.propertyMinPrice = this.parseOptionalNumber(minPrice, 'propertyMinPrice');
    }

    if (dto.propertyMaxPrice !== undefined) {
      property.propertyMaxPrice = this.parseOptionalNumber(
        dto.propertyMaxPrice,
        'propertyMaxPrice',
      );
    }

    if (dto.propertyAddress !== undefined) {
      property.propertyAddress = this.optionalText(dto.propertyAddress);
    }

    const latitude = dto.propertyLattitude ?? dto.propertyLatitude;
    if (latitude !== undefined) {
      property.propertyLattitude = this.optionalText(latitude);
    }

    if (dto.propertyLongitude !== undefined) {
      property.propertyLongitude = this.optionalText(dto.propertyLongitude);
    }

    if (dto.propertyStatus !== undefined) {
      property.propertyStatus =
        this.optionalText(dto.propertyStatus) ?? property.propertyStatus;
    }

    if (dto.propertyDescription !== undefined) {
      property.propertyDescription = this.optionalText(dto.propertyDescription);
    }

    if (dto.propertyArea !== undefined) {
      property.propertyArea = this.optionalText(dto.propertyArea);
    }

    if (dto.propertyTP !== undefined) {
      property.propertyTP = this.optionalText(dto.propertyTP);
    }

    if (dto.propertySIR !== undefined) {
      property.propertySIR = this.optionalText(dto.propertySIR);
    }

    if (dto.propertyListingType !== undefined) {
      property.propertyListingType = this.optionalText(dto.propertyListingType);
    }

    // Handle file uploads → resolve URLs, then assign to entity
    const [imageUrl, brochureUrl] = await Promise.all([
      this.resolveFileUrl(
        files?.propertyImage?.[0],
        dto.propertyImage,
        this.imagesDir,
        'images',
      ),
      this.resolveFileUrl(
        files?.propertyBroucher?.[0],
        dto.propertyBroucher,
        this.pdfDir,
        'pdf',
      ),
    ]);

    if (imageUrl !== null) {
      property.propertyImage = imageUrl;
    }

    if (brochureUrl !== null) {
      property.propertyBroucher = brochureUrl;
    }

    if (dto.updatedBy !== undefined) {
      property.updatedBy = dto.updatedBy;
    }

    return this.propertiesRepository.save(property);
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

  /**
   * Finds a property by id or throws.
   * Validation + lookup are service concerns; the raw query is delegated to the repository.
   */
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

  /**
   * Resolves the final asset URL for a field that can come from either
   * an uploaded file or a string value in the DTO.
   *
   * Priority: uploaded file > DTO string > null
   */
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

  // ─── Validation utilities ─────────────────────────────────

  private requireText(value: unknown, fieldName: string): string {
    if (typeof value !== 'string' || !value.trim()) {
      throw new BadRequestException(
        `${fieldName} is required and must be a non-empty string.`,
      );
    }
    return value.trim();
  }

  private optionalText(value: unknown): string | null {
    if (value === undefined || value === null) {
      return null;
    }
    const str = String(value).trim();
    return str.length > 0 ? str : null;
  }

  private parseOptionalNumber(
    value: unknown,
    fieldName: string,
  ): number | null {
    if (value === undefined || value === null || value === '') {
      return null;
    }
    const num = Number(value);
    if (isNaN(num)) {
      throw new BadRequestException(`${fieldName} must be a valid number.`);
    }
    return num;
  }

  // ─── File-system utilities ────────────────────────────────

  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  private saveUploadedFile(
    file: Express.Multer.File,
    targetDir: string,
    folderName: string,
  ): string {
    this.ensureDirectoryExists(targetDir);

    const ext = path.extname(file.originalname) || '';
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_');
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
