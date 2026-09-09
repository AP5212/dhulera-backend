import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { CreatePropertyDto } from './dto/create-property.dto';
import { DeletePropertyDto } from './dto/delete-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { Property } from './entities/property.entity';

export interface PropertyUploadedFiles {
  propertyImage?: Express.Multer.File[];
  propertyBroucher?: Express.Multer.File[];
  propertyBrochure?: Express.Multer.File[];
}

@Injectable()
export class PropertiesService {
  private readonly imagesDir = path.join(process.cwd(), 'assets', 'images');
  private readonly pdfDir = path.join(process.cwd(), 'assets', 'pdf');

  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
  ) {
    this.ensureDirectoryExists(this.imagesDir);
    this.ensureDirectoryExists(this.pdfDir);
  }

  async create(
    dto: CreatePropertyDto,
    files?: PropertyUploadedFiles,
    createdBy?: string,
  ): Promise<Property> {
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

    // Handle Image file or string url
    let propertyImagePath = this.optionalText(dto.propertyImage);
    const imageFile = files?.propertyImage?.[0];
    if (imageFile) {
      propertyImagePath = this.saveUploadedFile(imageFile, this.imagesDir, 'images');
    }

    // Handle Brochure PDF file or string url
    let propertyBroucherPath = this.optionalText(
      dto.propertyBroucher ?? dto.propertyBrochure,
    );
    const brochureFile = files?.propertyBroucher?.[0] ?? files?.propertyBrochure?.[0];
    if (brochureFile) {
      propertyBroucherPath = this.saveUploadedFile(brochureFile, this.pdfDir, 'pdf');
    }

    const newProperty = this.propertyRepository.create({
      propertyName,
      propertyMinPrice,
      propertyMaxPrice,
      propertyAddress,
      propertyLattitude,
      propertyLongitude,
      propertyStatus,
      propertyDescription,
      propertyArea,
      propertyImage: propertyImagePath,
      propertyTP,
      propertySIR,
      propertyListingType,
      propertyBroucher: propertyBroucherPath,
      createdBy: createdBy ?? null,
    });

    return this.propertyRepository.save(newProperty);
  }

  async findAll(): Promise<Property[]> {
    return this.propertyRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Property> {
    return this.findExisting(id);
  }

  async update(
    id: string,
    dto: UpdatePropertyDto,
    files?: PropertyUploadedFiles,
  ): Promise<Property> {
    const property = await this.findExisting(id);

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
      property.propertyStatus = this.optionalText(dto.propertyStatus) ?? property.propertyStatus;
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

    if (dto.propertyImage !== undefined) {
      property.propertyImage = this.optionalText(dto.propertyImage);
    }

    const imageFile = files?.propertyImage?.[0];
    if (imageFile) {
      property.propertyImage = this.saveUploadedFile(imageFile, this.imagesDir, 'images');
    }

    const brochureField = dto.propertyBroucher ?? dto.propertyBrochure;
    if (brochureField !== undefined) {
      property.propertyBroucher = this.optionalText(brochureField);
    }

    const brochureFile = files?.propertyBroucher?.[0] ?? files?.propertyBrochure?.[0];
    if (brochureFile) {
      property.propertyBroucher = this.saveUploadedFile(brochureFile, this.pdfDir, 'pdf');
    }

    if (dto.updatedBy !== undefined) {
      property.updatedBy = dto.updatedBy;
    }

    return this.propertyRepository.save(property);
  }

  async remove(id: string, dto?: DeletePropertyDto): Promise<Property> {
    const property = await this.findExisting(id);
    if (dto?.updatedBy) {
      property.updatedBy = dto.updatedBy;
    }
    property.propertyStatus = 'DELETED';
    return this.propertyRepository.save(property);
  }

  private async findExisting(id: string): Promise<Property> {
    if (!id || !/^\d+$/.test(id)) {
      throw new BadRequestException('Invalid property id.');
    }
    const property = await this.propertyRepository.findOneBy({ id });
    if (!property) {
      throw new NotFoundException(`Property with id '${id}' was not found.`);
    }
    return property;
  }

  private requireText(value: unknown, fieldName: string): string {
    if (typeof value !== 'string' || !value.trim()) {
      throw new BadRequestException(`${fieldName} is required and must be a non-empty string.`);
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

  private parseOptionalNumber(value: unknown, fieldName: string): number | null {
    if (value === undefined || value === null || value === '') {
      return null;
    }
    const num = Number(value);
    if (isNaN(num)) {
      throw new BadRequestException(`${fieldName} must be a valid number.`);
    }
    return num;
  }

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

    // If multer already saved to disk, move or use it; if buffer, write to disk
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
