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
import { State } from './state.entity';

@Entity('dhulera_districts')
@Index('uq_dhulera_districts_code', ['stateId', 'districtCode'], {
  unique: true,
})
export class District {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ name: 'state_id', type: 'bigint' })
  stateId!: string;

  @ManyToOne(() => State, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'state_id', referencedColumnName: 'id' })
  state!: State;

  @Column({ name: 'district_code', type: 'varchar', length: 20 })
  districtCode!: string;

  @Column({ name: 'district_name', type: 'varchar', length: 100 })
  districtName!: string;

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
