import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BannerStatus } from '../../common/enums/banner.enum';
import {
  CreateBannerDto,
  DeleteBannerDto,
  ReorderBannersDto,
  UpdateBannerDto,
} from './dto/banner.dto';
import { Banner } from './entities/banner.entity';

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepository: Repository<Banner>,
  ) {}

  async create(dto: CreateBannerDto, addedBy?: string): Promise<Banner> {
    const bannerName = this.requireText(dto.bannerName, 'bannerName');
    const pathOfBanner = this.requireText(dto.pathOfBanner, 'pathOfBanner');
    const creatorId = this.requireBigInt(addedBy || dto.addedBy, 'addedBy');

    // If bannerOrder not provided, calculate next order
    let bannerOrder = Number(dto.bannerOrder);
    if (isNaN(bannerOrder)) {
      const maxOrderBanner = await this.bannerRepository
        .createQueryBuilder('b')
        .where('b.status != :deleted', { deleted: BannerStatus.DELETED })
        .orderBy('b.bannerOrder', 'DESC')
        .getOne();
      bannerOrder = maxOrderBanner ? maxOrderBanner.bannerOrder + 1 : 1;
    }

    const banner = this.bannerRepository.create({
      bannerName,
      pathOfBanner,
      bannerOrder,
      status: this.validateStatus(dto.status),
      addedBy: creatorId,
    });

    return this.bannerRepository.save(banner);
  }

  async update(id: string, dto: UpdateBannerDto): Promise<Banner> {
    const banner = await this.findOne(id);

    if (dto.bannerName !== undefined) {
      banner.bannerName = this.requireText(dto.bannerName, 'bannerName');
    }
    if (dto.pathOfBanner !== undefined) {
      banner.pathOfBanner = this.requireText(dto.pathOfBanner, 'pathOfBanner');
    }
    if (dto.bannerOrder !== undefined) {
      banner.bannerOrder = Number(dto.bannerOrder) || 0;
    }
    if (dto.status !== undefined) {
      banner.status = this.validateStatus(dto.status);
    }
    banner.modifiedBy = this.optionalBigInt(dto.modifiedBy, 'modifiedBy');

    return this.bannerRepository.save(banner);
  }

  async remove(id: string, dto?: DeleteBannerDto): Promise<Banner> {
    const banner = await this.findOne(id);
    banner.status = BannerStatus.DELETED;
    banner.modifiedBy = this.optionalBigInt(dto?.modifiedBy, 'modifiedBy');
    return this.bannerRepository.save(banner);
  }

  async findAll(statusFilter?: string, search?: string): Promise<Banner[]> {
    const qb = this.bannerRepository.createQueryBuilder('b');

    if (statusFilter && statusFilter !== 'ALL') {
      qb.where('b.status = :status', { status: statusFilter });
    } else {
      qb.where('b.status != :deleted', { deleted: BannerStatus.DELETED });
    }

    if (search && search.trim()) {
      qb.andWhere(
        '(LOWER(b.banner_name) LIKE :search OR LOWER(b.path_of_banner) LIKE :search)',
        { search: `%${search.trim().toLowerCase()}%` },
      );
    }

    qb.orderBy('b.banner_order', 'ASC').addOrderBy('b.banner_id', 'ASC');

    return qb.getMany();
  }

  async findActive(): Promise<Banner[]> {
    return this.bannerRepository.find({
      where: { status: BannerStatus.ACTIVE },
      order: { bannerOrder: 'ASC', bannerId: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Banner> {
    const banner = await this.bannerRepository.findOneBy({
      bannerId: this.requireBigInt(id, 'bannerId'),
    });
    if (!banner || banner.status === BannerStatus.DELETED) {
      throw new NotFoundException(`Banner with ID '${id}' was not found.`);
    }
    return banner;
  }

  async reorder(dto: ReorderBannersDto): Promise<boolean> {
    if (!Array.isArray(dto.orders)) {
      throw new BadRequestException('orders array is required');
    }

    for (const item of dto.orders) {
      if (item.bannerId && typeof item.bannerOrder === 'number') {
        await this.bannerRepository.update(
          { bannerId: item.bannerId },
          {
            bannerOrder: item.bannerOrder,
            modifiedBy: this.optionalBigInt(dto.modifiedBy, 'modifiedBy'),
          },
        );
      }
    }
    return true;
  }

  private requireText(value: unknown, fieldName: string): string {
    if (typeof value !== 'string' || !value.trim()) {
      throw new BadRequestException(
        `${fieldName} is required and must be a non-empty string.`,
      );
    }
    return value.trim();
  }

  private requireBigInt(value: unknown, fieldName: string): string {
    const normalized = String(value ?? '');
    if (!/^\d+$/.test(normalized) || BigInt(normalized) <= 0n) {
      throw new BadRequestException(`${fieldName} must be a positive integer.`);
    }
    return normalized;
  }

  private optionalBigInt(value: unknown, fieldName: string): string | null {
    return value === undefined || value === null
      ? null
      : this.requireBigInt(value, fieldName);
  }

  private validateStatus(status?: BannerStatus): BannerStatus {
    if (status === undefined) return BannerStatus.ACTIVE;
    if (!Object.values(BannerStatus).includes(status)) {
      throw new BadRequestException(
        'status must be ACTIVE, INACTIVE, DRAFT, or DELETED.',
      );
    }
    return status;
  }
}
