import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StaticContentStatus, StaticContentType } from '../../common/enums/static-content.enum';
import { CreateStaticContentDto } from './dto/create-static-content.dto';
import { DeleteStaticContentDto } from './dto/delete-static-content.dto';
import { UpdateStaticContentDto } from './dto/update-static-content.dto';
import { StaticContent } from './entities/static-content.entity';

@Injectable()
export class StaticContentService {
  constructor(
    @InjectRepository(StaticContent)
    private readonly staticContentRepository: Repository<StaticContent>,
  ) {}

  async create(createStaticContentDto: CreateStaticContentDto): Promise<StaticContent> {
    const contentType = this.validateContentType(createStaticContentDto.contentType);
    const content = this.requireText(createStaticContentDto.content, 'content');
    const addedBy = this.requireBigInt(createStaticContentDto.addedBy, 'addedBy');
    const status = this.validateStatus(createStaticContentDto.status);

    const existingContent = await this.staticContentRepository.findOneBy({ contentType });
    if (existingContent) {
      throw new ConflictException(`Static content for content type '${contentType}' is already created.`);
    }

    return this.staticContentRepository.save(
      this.staticContentRepository.create({ contentType, content, addedBy, status }),
    );
  }

  async update(id: string, updateStaticContentDto: UpdateStaticContentDto): Promise<StaticContent> {
    const staticContent = await this.findExisting(id);
    const updatedBy = this.requireBigInt(updateStaticContentDto.updatedBy, 'updatedBy');

    if (updateStaticContentDto.contentType !== undefined) {
      const contentType = this.validateContentType(updateStaticContentDto.contentType);
      if (contentType !== staticContent.contentType) {
        const existingContent = await this.staticContentRepository.findOneBy({ contentType });
        if (existingContent) {
          throw new ConflictException(`Static content for content type '${contentType}' is already created.`);
        }
        staticContent.contentType = contentType;
      }
    }

    if (updateStaticContentDto.content !== undefined) {
      staticContent.content = this.requireText(updateStaticContentDto.content, 'content');
    }
    if (updateStaticContentDto.status !== undefined) {
      staticContent.status = this.validateStatus(updateStaticContentDto.status);
    }

    staticContent.updatedBy = updatedBy;
    return this.staticContentRepository.save(staticContent);
  }

  async remove(id: string, deleteStaticContentDto: DeleteStaticContentDto): Promise<StaticContent> {
    const staticContent = await this.findExisting(id);
    staticContent.updatedBy = this.requireBigInt(deleteStaticContentDto.updatedBy, 'updatedBy');
    staticContent.status = StaticContentStatus.DELETED;
    return this.staticContentRepository.save(staticContent);
  }

  async findOne(id: string): Promise<StaticContent> {
    return this.findExisting(id);
  }

  private async findExisting(id: string): Promise<StaticContent> {
    const staticContentId = this.requireBigInt(id, 'id');
    const staticContent = await this.staticContentRepository.findOneBy({ id: staticContentId });
    if (!staticContent) {
      throw new NotFoundException(`Static content with id '${id}' was not found.`);
    }
    return staticContent;
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

  private validateContentType(value: unknown): StaticContentType {
    if (!Object.values(StaticContentType).includes(value as StaticContentType)) {
      throw new BadRequestException(
        'contentType must be ABOUT_US, PRIVACY_POLICY, TERMS_AND_CONDITIONS, CONTACT_US, or FAQ.',
      );
    }
    return value as StaticContentType;
  }

  private validateStatus(status?: StaticContentStatus): StaticContentStatus {
    if (status === undefined) {
      return StaticContentStatus.ACTIVE;
    }
    if (!Object.values(StaticContentStatus).includes(status)) {
      throw new BadRequestException('status must be ACTIVE, INACTIVE, DRAFT, or DELETED.');
    }
    return status;
  }
}
