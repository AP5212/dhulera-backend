import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { RoleStatus } from '../../../common/enums/role.enum';

@Entity('dhulera_roles')
@Unique('uq_dhulera_roles_code', ['roleCode'])
@Unique('uq_dhulera_roles_name', ['roleName'])
@Check(
  'chk_dhulera_roles_status',
  "status IN ('ACTIVE', 'INACTIVE', 'DELETED')",
)
export class Role {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ name: 'role_code', type: 'varchar', length: 50 })
  roleCode!: string;

  @Column({ name: 'role_name', type: 'varchar', length: 100 })
  roleName!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 20, default: RoleStatus.ACTIVE })
  status!: RoleStatus;

  @Column({ name: 'created_by', type: 'bigint', nullable: true })
  createdBy!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @Column({ name: 'updated_by', type: 'bigint', nullable: true })
  updatedBy!: string | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt!: Date | null;
}
