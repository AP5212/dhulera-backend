import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocationStatus } from '../../common/enums/location.enum';
import {
  CreateDistrictDto,
  CreateStateDto,
  CreateSubDistrictDto,
  DeleteLocationDto,
  UpdateDistrictDto,
  UpdateStateDto,
  UpdateSubDistrictDto,
} from './dto/location.dto';
import { District } from './entities/district.entity';
import { State } from './entities/state.entity';
import { SubDistrict } from './entities/sub-district.entity';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(State)
    private readonly stateRepository: Repository<State>,
    @InjectRepository(District)
    private readonly districtRepository: Repository<District>,
    @InjectRepository(SubDistrict)
    private readonly subDistrictRepository: Repository<SubDistrict>,
  ) {}

  async createState(dto: CreateStateDto, authenticatedUserId: string): Promise<State> {
    const stateCode = this.requireText(dto.stateCode, 'stateCode');
    const stateName = this.requireText(dto.stateName, 'stateName');
    await this.ensureStateUnique(stateCode, stateName);
    return this.stateRepository.save(
      this.stateRepository.create({
        stateCode,
        stateName,
        createdBy: this.requireBigInt(authenticatedUserId, 'createdBy'),
        status: this.validateStatus(dto.status),
      }),
    );
  }

  async updateState(id: string, dto: UpdateStateDto): Promise<State> {
    const state = await this.findState(id);
    const stateCode =
      dto.stateCode === undefined
        ? state.stateCode
        : this.requireText(dto.stateCode, 'stateCode');
    const stateName =
      dto.stateName === undefined
        ? state.stateName
        : this.requireText(dto.stateName, 'stateName');
    if (stateCode !== state.stateCode || stateName !== state.stateName) {
      await this.ensureStateUnique(stateCode, stateName, state.id);
    }
    state.stateCode = stateCode;
    state.stateName = stateName;
    state.updatedBy = this.optionalBigInt(dto.updatedBy, 'updatedBy');
    if (dto.status !== undefined)
      state.status = this.validateStatus(dto.status);
    return this.stateRepository.save(state);
  }

  async deleteState(id: string, dto: DeleteLocationDto): Promise<State> {
    const state = await this.findState(id);
    state.updatedBy = this.optionalBigInt(dto.updatedBy, 'updatedBy');
    state.status = LocationStatus.DELETED;
    return this.stateRepository.save(state);
  }

  async findStates(): Promise<State[]> {
    return this.stateRepository.find({ order: { stateName: 'ASC' } });
  }

  async createDistrict(
    dto: CreateDistrictDto,
    authenticatedUserId: string,
  ): Promise<District> {
    const stateId = await this.requireActiveState(dto.stateId);
    const districtCode = this.requireText(dto.districtCode, 'districtCode');
    await this.ensureDistrictCodeUnique(stateId, districtCode);
    return this.districtRepository.save(
      this.districtRepository.create({
        stateId,
        districtCode,
        districtName: this.requireText(dto.districtName, 'districtName'),
        createdBy: this.requireBigInt(authenticatedUserId, 'createdBy'),
        status: this.validateStatus(dto.status),
      }),
    );
  }

  async updateDistrict(id: string, dto: UpdateDistrictDto): Promise<District> {
    const district = await this.findDistrict(id);
    const stateId =
      dto.stateId === undefined
        ? district.stateId
        : await this.requireActiveState(dto.stateId);
    const districtCode =
      dto.districtCode === undefined
        ? district.districtCode
        : this.requireText(dto.districtCode, 'districtCode');
    if (
      stateId !== district.stateId ||
      districtCode !== district.districtCode
    ) {
      await this.ensureDistrictCodeUnique(stateId, districtCode, district.id);
    }
    district.stateId = stateId;
    district.districtCode = districtCode;
    if (dto.districtName !== undefined)
      district.districtName = this.requireText(
        dto.districtName,
        'districtName',
      );
    district.updatedBy = this.optionalBigInt(dto.updatedBy, 'updatedBy');
    if (dto.status !== undefined)
      district.status = this.validateStatus(dto.status);
    return this.districtRepository.save(district);
  }

  async deleteDistrict(id: string, dto: DeleteLocationDto): Promise<District> {
    const district = await this.findDistrict(id);
    district.updatedBy = this.optionalBigInt(dto.updatedBy, 'updatedBy');
    district.status = LocationStatus.DELETED;
    return this.districtRepository.save(district);
  }

  async findDistricts(stateId?: string): Promise<District[]> {
    if (stateId === undefined)
      return this.districtRepository.find({ order: { districtName: 'ASC' } });
    return this.districtRepository.find({
      where: { stateId: this.requireBigInt(stateId, 'stateId') },
      order: { districtName: 'ASC' },
    });
  }

  async createSubDistrict(
    dto: CreateSubDistrictDto,
    authenticatedUserId: string,
  ): Promise<SubDistrict> {
    const districtId = await this.requireActiveDistrict(dto.districtId);
    const subDistrictCode = this.requireText(
      dto.subDistrictCode,
      'subDistrictCode',
    );
    await this.ensureSubDistrictCodeUnique(districtId, subDistrictCode);
    return this.subDistrictRepository.save(
      this.subDistrictRepository.create({
        districtId,
        subDistrictCode,
        subDistrictName: this.requireText(
          dto.subDistrictName,
          'subDistrictName',
        ),
        createdBy: this.requireBigInt(authenticatedUserId, 'createdBy'),
        status: this.validateStatus(dto.status),
      }),
    );
  }

  async updateSubDistrict(
    id: string,
    dto: UpdateSubDistrictDto,
  ): Promise<SubDistrict> {
    const subDistrict = await this.findSubDistrict(id);
    const districtId =
      dto.districtId === undefined
        ? subDistrict.districtId
        : await this.requireActiveDistrict(dto.districtId);
    const subDistrictCode =
      dto.subDistrictCode === undefined
        ? subDistrict.subDistrictCode
        : this.requireText(dto.subDistrictCode, 'subDistrictCode');
    if (
      districtId !== subDistrict.districtId ||
      subDistrictCode !== subDistrict.subDistrictCode
    ) {
      await this.ensureSubDistrictCodeUnique(
        districtId,
        subDistrictCode,
        subDistrict.id,
      );
    }
    subDistrict.districtId = districtId;
    subDistrict.subDistrictCode = subDistrictCode;
    if (dto.subDistrictName !== undefined)
      subDistrict.subDistrictName = this.requireText(
        dto.subDistrictName,
        'subDistrictName',
      );
    subDistrict.updatedBy = this.optionalBigInt(dto.updatedBy, 'updatedBy');
    if (dto.status !== undefined)
      subDistrict.status = this.validateStatus(dto.status);
    return this.subDistrictRepository.save(subDistrict);
  }

  async deleteSubDistrict(
    id: string,
    dto: DeleteLocationDto,
  ): Promise<SubDistrict> {
    const subDistrict = await this.findSubDistrict(id);
    subDistrict.updatedBy = this.optionalBigInt(dto.updatedBy, 'updatedBy');
    subDistrict.status = LocationStatus.DELETED;
    return this.subDistrictRepository.save(subDistrict);
  }

  async findSubDistricts(districtId?: string): Promise<SubDistrict[]> {
    if (districtId === undefined)
      return this.subDistrictRepository.find({
        order: { subDistrictName: 'ASC' },
      });
    return this.subDistrictRepository.find({
      where: { districtId: this.requireBigInt(districtId, 'districtId') },
      order: { subDistrictName: 'ASC' },
    });
  }

  findState(id: string): Promise<State> {
    return this.findById(this.stateRepository, id, 'State');
  }

  findDistrict(id: string): Promise<District> {
    return this.findById(this.districtRepository, id, 'District');
  }

  findSubDistrict(id: string): Promise<SubDistrict> {
    return this.findById(this.subDistrictRepository, id, 'Sub-district');
  }

  private async requireActiveState(value: unknown): Promise<string> {
    const state = await this.findState(this.requireBigInt(value, 'stateId'));
    if (state.status !== LocationStatus.ACTIVE)
      throw new BadRequestException(
        `Active state with id '${state.id}' was not found.`,
      );
    return state.id;
  }

  private async requireActiveDistrict(value: unknown): Promise<string> {
    const district = await this.findDistrict(
      this.requireBigInt(value, 'districtId'),
    );
    if (district.status !== LocationStatus.ACTIVE)
      throw new BadRequestException(
        `Active district with id '${district.id}' was not found.`,
      );
    return district.id;
  }

  private async ensureStateUnique(
    stateCode: string,
    stateName: string,
    currentId?: string,
  ): Promise<void> {
    const normalizedStateCode = this.normalizeForComparison(stateCode);
    const normalizedStateName = this.normalizeForComparison(stateName);
    const existing = await this.stateRepository
      .createQueryBuilder('state')
      .where(
        'LOWER(TRIM(state.state_code)) = :stateCode OR LOWER(TRIM(state.state_name)) = :stateName',
        {
          stateCode: normalizedStateCode,
          stateName: normalizedStateName,
        },
      )
      .getOne();
    if (existing && existing.id !== currentId)
      throw new ConflictException(
        'A state with this code or name already exists.',
      );
  }

  private async ensureDistrictCodeUnique(
    stateId: string,
    districtCode: string,
    currentId?: string,
  ): Promise<void> {
    const existing = await this.districtRepository
      .createQueryBuilder('district')
      .where('district.state_id = :stateId', { stateId })
      .andWhere('LOWER(TRIM(district.district_code)) = :districtCode', {
        districtCode: this.normalizeForComparison(districtCode),
      })
      .getOne();
    if (existing && existing.id !== currentId)
      throw new ConflictException(
        'A district with this code already exists in the state.',
      );
  }

  private async ensureSubDistrictCodeUnique(
    districtId: string,
    subDistrictCode: string,
    currentId?: string,
  ): Promise<void> {
    const existing = await this.subDistrictRepository
      .createQueryBuilder('subDistrict')
      .where('subDistrict.district_id = :districtId', { districtId })
      .andWhere(
        'LOWER(TRIM(subDistrict.sub_district_code)) = :subDistrictCode',
        { subDistrictCode: this.normalizeForComparison(subDistrictCode) },
      )
      .getOne();
    if (existing && existing.id !== currentId)
      throw new ConflictException(
        'A sub-district with this code already exists in the district.',
      );
  }

  private async findById<T extends { id: string }>(
    repository: Repository<T>,
    id: string,
    label: string,
  ): Promise<T> {
    const entity = await repository.findOneBy({
      id: this.requireBigInt(id, 'id'),
    } as never);
    if (!entity)
      throw new NotFoundException(`${label} with id '${id}' was not found.`);
    return entity;
  }

  private requireText(value: unknown, fieldName: string): string {
    if (typeof value !== 'string' || !value.trim())
      throw new BadRequestException(
        `${fieldName} is required and must be a non-empty string.`,
      );
    return value.trim();
  }

  private normalizeForComparison(value: string): string {
    return value.trim().toLowerCase();
  }

  private requireBigInt(value: unknown, fieldName: string): string {
    const normalized = String(value ?? '');
    if (!/^\d+$/.test(normalized) || BigInt(normalized) <= 0n)
      throw new BadRequestException(`${fieldName} must be a positive integer.`);
    return normalized;
  }

  private optionalBigInt(value: unknown, fieldName: string): string | null {
    return value === undefined || value === null
      ? null
      : this.requireBigInt(value, fieldName);
  }

  private validateStatus(status?: LocationStatus): LocationStatus {
    if (status === undefined) return LocationStatus.ACTIVE;
    if (!Object.values(LocationStatus).includes(status))
      throw new BadRequestException(
        'status must be ACTIVE, INACTIVE, or DELETED.',
      );
    return status;
  }
}
