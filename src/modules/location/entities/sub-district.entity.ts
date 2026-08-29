import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LocationStatus } from '../../../common/enums/location.enum';
import { District } from './district.entity';

@Entity('dhulera_sub_districts')
@Index('uq_dhulera_sub_districts_code', ['districtId', 'subDistrictCode'], {
  unique: true,
})
export class SubDistrict {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ name: 'district_id', type: 'bigint' })
  districtId!: string;

  @ManyToOne(() => District, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'district_id', referencedColumnName: 'id' })
  district!: District;

  @Column({ name: 'sub_district_code', type: 'varchar', length: 20 })
  subDistrictCode!: string;

  @Column({ name: 'sub_district_name', type: 'varchar', length: 100 })
  subDistrictName!: string;

  @Column({ type: 'varchar', length: 20, default: LocationStatus.ACTIVE })
  status!: LocationStatus;

  @Column({ name: 'created_by', type: 'bigint', nullable: true })
  createdBy!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @Column({ name: 'updated_by', type: 'bigint', nullable: true })
  updatedBy!: string | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt!: Date | null;
}
