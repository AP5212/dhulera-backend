import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

@Entity('dhulera_users')
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ name: 'mobile_country_code', type: 'varchar', length: 10, nullable: true })
  mobileCountryCode: string | null;

  @Index()
  @Column({ name: 'mobile_number', type: 'varchar', length: 20, unique: true, nullable: true })
  mobileNumber!: string | null;

  @Column({ name: 'password', type: 'varchar', length: 255, nullable: true, select: false })
  password!: string | null;

  @Column({ name: "is_property_user", type: "boolean", default: false })
  isPropertyUser: boolean;

  @Column({ name: "role_id", type: "bigint", nullable: true })
  roleId!: string;

  @Column({ type: "varchar", length: 150, enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ name: "is_deleted", type: "boolean", default: false })
  isDeleted: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt!: Date | null;


}
