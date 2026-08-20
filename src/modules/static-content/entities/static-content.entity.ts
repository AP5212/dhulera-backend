import { Check, Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { StaticContentStatus } from '../../../common/enums/static-content.enum';

@Entity('dhulera_static_content')
@Index('idx_dhulera_static_content_type', ['contentType'])
@Index('idx_dhulera_static_content_status', ['status'])
@Check('chk_dhulera_static_content_status', "status IN ('ACTIVE', 'INACTIVE', 'DRAFT', 'DELETED')")
export class StaticContent {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'content_type', type: 'varchar', length: 50 })
  contentType: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'added_by', type: 'bigint' })
  addedBy: string;

  @CreateDateColumn({ name: 'added_date', type: 'timestamp' })
  addedDate: Date;

  @Column({ name: 'updated_by', type: 'bigint', nullable: true })
  updatedBy: string | null;

  @UpdateDateColumn({ name: 'updated_date', type: 'timestamp', nullable: true })
  updatedDate: Date | null;

  @Column({
    type: 'varchar',
    length: 20,
    default: StaticContentStatus.ACTIVE,
  })
  status: StaticContentStatus;
}
