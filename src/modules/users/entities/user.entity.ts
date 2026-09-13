import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('dhulera_users')
@Unique('uq_dhulera_users_email', ['email'])
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ type: 'varchar', length: 150, default: '' })
  name!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ name: 'password', type: 'varchar', length: 255, nullable: true, select: false })
  password!: string | null;

  @Column({
    name: 'mobile_number',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  mobileNumber!: string | null;

  @Column({
    name: 'mobile_country_code',
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  mobileCountryCode!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt!: Date | null;
}
