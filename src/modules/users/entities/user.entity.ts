import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { UserStatus } from '../../../common/enums/user.enum';

@Entity('dhulera_users')
@Unique('uq_dhulera_users_username', ['username'])
@Unique('uq_dhulera_users_email', ['email'])
@Unique('uq_dhulera_users_mobile', ['mobileNumber'])
@Check(
  'chk_dhulera_users_status',
  "status IN ('ACTIVE', 'INACTIVE', 'BLOCKED', 'DELETED')",
)
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  username!: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName!: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: true })
  lastName!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email!: string | null;

  @Column({
    name: 'mobile_number',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  mobileNumber!: string | null;

  @Column({ name: 'password_hash', type: 'text', select: false })
  passwordHash!: string;

  @Column({ name: 'role_id', type: 'bigint' })
  roleId!: string;

  @Column({ name: 'parent_id', type: 'bigint', nullable: true })
  parentId!: string | null;

  @Column({ name: 'state_id', type: 'bigint', nullable: true })
  stateId!: string | null;

  @Column({ name: 'district_id', type: 'bigint', nullable: true })
  districtId!: string | null;

  @Column({ name: 'sub_district_id', type: 'bigint', nullable: true })
  subDistrictId!: string | null;

  @Column({ name: 'location', type: 'varchar', length: 255, nullable: true })
  location!: string | null;

  @Column({ name: 'email_verified', type: 'boolean', default: false })
  emailVerified!: boolean;

  @Column({ name: 'mobile_verified', type: 'boolean', default: false })
  mobileVerified!: boolean;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt!: Date | null;

  @Column({ name: 'failed_login_count', type: 'int', default: 0 })
  failedLoginCount!: number;

  @Column({ name: 'locked_until', type: 'timestamp', nullable: true })
  lockedUntil!: Date | null;

  @Column({ type: 'varchar', length: 20, default: UserStatus.ACTIVE })
  status!: UserStatus;

  @Column({ name: 'created_by', type: 'bigint', nullable: true })
  createdBy!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @Column({ name: 'updated_by', type: 'bigint', nullable: true })
  updatedBy!: string | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt!: Date | null;
}
