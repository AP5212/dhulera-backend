import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleStatus } from '../../common/enums/role.enum';
import { CreateRoleDto, DeleteRoleDto, UpdateRoleDto } from './dto/role.dto';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
  ) {}

  async create(dto: CreateRoleDto, createdBy: string): Promise<Role> {
    const roleCode = this.requireText(dto.roleCode, 'roleCode');
    const roleName = this.requireText(dto.roleName, 'roleName');
    await this.ensureUnique(roleCode, roleName);
    return this.roleRepository.save(
      this.roleRepository.create({
        roleCode,
        roleName,
        description: this.optionalText(dto.description, 'description'),
        status: this.validateStatus(dto.status),
        createdBy: this.requireBigInt(createdBy, 'createdBy'),
      }),
    );
  }

  async update(id: string, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);
    const roleCode =
      dto.roleCode === undefined
        ? role.roleCode
        : this.requireText(dto.roleCode, 'roleCode');
    const roleName =
      dto.roleName === undefined
        ? role.roleName
        : this.requireText(dto.roleName, 'roleName');
    if (roleCode !== role.roleCode || roleName !== role.roleName)
      await this.ensureUnique(roleCode, roleName, role.id);

    role.roleCode = roleCode;
    role.roleName = roleName;
    if (dto.description !== undefined)
      role.description = this.optionalText(dto.description, 'description');
    if (dto.status !== undefined) role.status = this.validateStatus(dto.status);
    role.updatedBy = this.optionalBigInt(dto.updatedBy, 'updatedBy');
    return this.roleRepository.save(role);
  }

  async remove(id: string, dto: DeleteRoleDto): Promise<Role> {
    const role = await this.findOne(id);
    role.status = RoleStatus.DELETED;
    role.updatedBy = this.optionalBigInt(dto.updatedBy, 'updatedBy');
    return this.roleRepository.save(role);
  }

  findAll(): Promise<Role[]> {
    return this.roleRepository.find({ order: { roleName: 'ASC' } });
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepository.findOneBy({
      id: this.requireBigInt(id, 'id'),
    });
    if (!role)
      throw new NotFoundException(`Role with id '${id}' was not found.`);
    return role;
  }

  private async ensureUnique(
    roleCode: string,
    roleName: string,
    currentId?: string,
  ): Promise<void> {
    const existing = await this.roleRepository
      .createQueryBuilder('role')
      .where('role.role_code = :roleCode OR role.role_name = :roleName', {
        roleCode,
        roleName,
      })
      .getOne();
    if (existing && existing.id !== currentId)
      throw new ConflictException(
        'A role with this code or name already exists.',
      );
  }

  private requireText(value: unknown, fieldName: string): string {
    if (typeof value !== 'string' || !value.trim())
      throw new BadRequestException(
        `${fieldName} is required and must be a non-empty string.`,
      );
    return value.trim();
  }

  private optionalText(value: unknown, fieldName: string): string | null {
    if (value === undefined || value === null) return null;
    return this.requireText(value, fieldName);
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

  private validateStatus(status?: RoleStatus): RoleStatus {
    if (status === undefined) return RoleStatus.ACTIVE;
    if (!Object.values(RoleStatus).includes(status))
      throw new BadRequestException(
        'status must be ACTIVE, INACTIVE, or DELETED.',
      );
    return status;
  }
}
