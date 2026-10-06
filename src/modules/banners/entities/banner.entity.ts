import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BannerStatus } from '../../../common/enums/banner.enum';

@Entity('dhulera_banner')
@Check(
  'chk_banner_status',
  "status IN ('ACTIVE', 'INACTIVE', 'DRAFT', 'DELETED')",
)
export class Banner {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'banner_id' })
  bannerId!: string;

  @Column({ name: 'banner_name', type: 'varchar', length: 255 })
  bannerName!: string;

  @Column({ name: 'path_of_banner', type: 'text' })
  pathOfBanner!: string;

  @Column({ name: 'banner_order', type: 'int', default: 0 })
  bannerOrder!: number;

  @Column({ type: 'varchar', length: 20, default: BannerStatus.ACTIVE })
  status!: BannerStatus;

  @CreateDateColumn({ name: 'added_date', type: 'timestamp' })
  addedDate!: Date;

  @UpdateDateColumn({ name: 'updated_date', type: 'timestamp', nullable: true })
  updatedDate!: Date | null;

  @Column({ name: 'added_by', type: 'bigint' })
  addedBy!: string;

  @Column({ name: 'modified_by', type: 'bigint', nullable: true })
  modifiedBy!: string | null;
}
