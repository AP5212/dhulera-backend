import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LocationStatus } from '../../../common/enums/location.enum';

@Entity('dhulera_states')
@Index('uq_dhulera_states_code', ['stateCode'], { unique: true })
@Index('uq_dhulera_states_name', ['stateName'], { unique: true })
export class State {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ name: 'state_code', type: 'varchar', length: 20 })
  stateCode!: string;

  @Column({ name: 'state_name', type: 'varchar', length: 100 })
  stateName!: string;

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
