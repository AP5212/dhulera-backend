import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MasterCategoryStatus } from '../../../common/enums/master-category.enum';

@Entity('dhulera_master_category')
@Index('idx_dhulera_master_category_type', ['categoryType'])
@Index('idx_dhulera_master_category_parent', ['parentId'])
@Index('idx_dhulera_master_category_status', ['status'])
@Check('chk_dhulera_master_category_status', "status IN ('ACTIVE', 'INACTIVE', 'DELETED')")
export class MasterCategory {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ name: 'category_type', type: 'varchar', length: 50 })
  categoryType!: string;

  @Column({ name: 'category_name', type: 'varchar', length: 150 })
  categoryName!: string;

  @Column({ name: 'parent_id', type: 'bigint', nullable: true })
  parentId!: string | null;

  @ManyToOne(() => MasterCategory, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'parent_id', referencedColumnName: 'id' })
  parent!: MasterCategory | null;

  @Column({ name: 'created_by', type: 'bigint' })
  createdBy!: string;

  @CreateDateColumn({ name: 'created_date', type: 'timestamp' })
  createdDate!: Date;

  @Column({ name: 'updated_by', type: 'bigint', nullable: true })
  updatedBy!: string | null;

  @UpdateDateColumn({ name: 'updated_date', type: 'timestamp', nullable: true })
  updatedDate!: Date | null;

  @Column({ type: 'varchar', length: 20, default: MasterCategoryStatus.ACTIVE })
  status!: MasterCategoryStatus;
}
