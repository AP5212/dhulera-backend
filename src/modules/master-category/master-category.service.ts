import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { MasterCategoryStatus, MasterCategoryType } from '../../common/enums/master-category.enum';
import { CreateMasterCategoryDto } from './dto/create-master-category.dto';
import { DeleteMasterCategoryDto } from './dto/delete-master-category.dto';
import { UpdateMasterCategoryDto } from './dto/update-master-category.dto';
import { MasterCategory } from './entities/master-category.entity';

@Injectable()
export class MasterCategoryService {
  constructor(
    @InjectRepository(MasterCategory)
    private readonly masterCategoryRepository: Repository<MasterCategory>,
  ) {}

  async create(createMasterCategoryDto: CreateMasterCategoryDto): Promise<MasterCategory> {
    const categoryType = this.validateCategoryType(createMasterCategoryDto.categoryType);
    const categoryName = this.requireText(createMasterCategoryDto.categoryName, 'categoryName');
    const parentId = await this.validateParentId(createMasterCategoryDto.parentId);
    const createdBy = this.requireBigInt(createMasterCategoryDto.createdBy, 'createdBy');
    const status = this.validateStatus(createMasterCategoryDto.status);

    await this.ensureCategoryDoesNotExist(categoryType, categoryName, parentId);
    return this.masterCategoryRepository.save(
      this.masterCategoryRepository.create({ categoryType, categoryName, parentId, createdBy, status }),
    );
  }

  async createSubCategory(createMasterCategoryDto: CreateMasterCategoryDto): Promise<MasterCategory> {
    if (createMasterCategoryDto.parentId === undefined || createMasterCategoryDto.parentId === null) {
      throw new BadRequestException('parentId is required when creating a subcategory.');
    }
    return this.create(createMasterCategoryDto);
  }

  async update(id: string, updateMasterCategoryDto: UpdateMasterCategoryDto): Promise<MasterCategory> {
    const category = await this.findExisting(id);
    const updatedBy = this.requireBigInt(updateMasterCategoryDto.updatedBy, 'updatedBy');
    const categoryType =
      updateMasterCategoryDto.categoryType === undefined
        ? category.categoryType
        : this.validateCategoryType(updateMasterCategoryDto.categoryType);
    const categoryName =
      updateMasterCategoryDto.categoryName === undefined
        ? category.categoryName
        : this.requireText(updateMasterCategoryDto.categoryName, 'categoryName');
    const parentId =
      updateMasterCategoryDto.parentId === undefined
        ? category.parentId
        : await this.validateParentId(updateMasterCategoryDto.parentId, category.id);

    if (
      categoryType !== category.categoryType ||
      categoryName !== category.categoryName ||
      parentId !== category.parentId
    ) {
      await this.ensureCategoryDoesNotExist(categoryType, categoryName, parentId, category.id);
    }

    category.categoryType = categoryType;
    category.categoryName = categoryName;
    category.parentId = parentId;
    category.updatedBy = updatedBy;
    if (updateMasterCategoryDto.status !== undefined) {
      category.status = this.validateStatus(updateMasterCategoryDto.status);
    }
    return this.masterCategoryRepository.save(category);
  }

  async remove(id: string, deleteMasterCategoryDto: DeleteMasterCategoryDto): Promise<MasterCategory> {
    const category = await this.findExisting(id);
    category.updatedBy = this.requireBigInt(deleteMasterCategoryDto.updatedBy, 'updatedBy');
    category.status = MasterCategoryStatus.DELETED;
    return this.masterCategoryRepository.save(category);
  }

  async findOne(id: string): Promise<MasterCategory> {
    return this.findExisting(id);
  }

  async findAll(parentId?: string): Promise<MasterCategory[]> {
    if (parentId === undefined) {
      return this.masterCategoryRepository.find({ order: { categoryType: 'ASC', categoryName: 'ASC' } });
    }
    const normalizedParentId = this.requireBigInt(parentId, 'parentId');
    return this.masterCategoryRepository.find({
      where: { parentId: normalizedParentId },
      order: { categoryType: 'ASC', categoryName: 'ASC' },
    });
  }

  private async findExisting(id: string): Promise<MasterCategory> {
    const categoryId = this.requireBigInt(id, 'id');
    const category = await this.masterCategoryRepository.findOneBy({ id: categoryId });
    if (!category) {
      throw new NotFoundException(`Master category with id '${id}' was not found.`);
    }
    return category;
  }

  private async validateParentId(parentId: string | null | undefined, categoryId?: string): Promise<string | null> {
    if (parentId === undefined || parentId === null) {
      return null;
    }
    const normalizedParentId = this.requireBigInt(parentId, 'parentId');
    if (normalizedParentId === categoryId) {
      throw new BadRequestException('A category cannot be its own parent.');
    }
    const parent = await this.masterCategoryRepository.findOneBy({ id: normalizedParentId });
    if (!parent || parent.status === MasterCategoryStatus.DELETED) {
      throw new BadRequestException(`Active parent category with id '${parentId}' was not found.`);
    }
    return normalizedParentId;
  }

  private async ensureCategoryDoesNotExist(
    categoryType: string,
    categoryName: string,
    parentId: string | null,
    currentId?: string,
  ): Promise<void> {
    const existingCategory = await this.masterCategoryRepository.findOne({
      where: { categoryType, categoryName, parentId: parentId ?? IsNull() },
    });
    if (existingCategory && existingCategory.id !== currentId) {
      throw new ConflictException(
        `Category '${categoryName}' already exists for this category type and parent category.`,
      );
    }
  }

  private requireText(value: unknown, fieldName: string): string {
    if (typeof value !== 'string' || !value.trim()) {
      throw new BadRequestException(`${fieldName} is required and must be a non-empty string.`);
    }
    return value.trim();
  }

  private requireBigInt(value: unknown, fieldName: string): string {
    const normalizedValue = String(value ?? '');
    if (!/^\d+$/.test(normalizedValue) || BigInt(normalizedValue) <= 0n) {
      throw new BadRequestException(`${fieldName} is required and must be a positive integer.`);
    }
    return normalizedValue;
  }

  private validateCategoryType(value: unknown): MasterCategoryType {
    if (!Object.values(MasterCategoryType).includes(value as MasterCategoryType)) {
      throw new BadRequestException('categoryType must be PROPERTY_TYPE, PROPERTY_ZONE, AMENITY, or LOCATION.');
    }
    return value as MasterCategoryType;
  }

  private validateStatus(status?: MasterCategoryStatus): MasterCategoryStatus {
    if (status === undefined) {
      return MasterCategoryStatus.ACTIVE;
    }
    if (!Object.values(MasterCategoryStatus).includes(status)) {
      throw new BadRequestException('status must be ACTIVE, INACTIVE, or DELETED.');
    }
    return status;
  }
}
