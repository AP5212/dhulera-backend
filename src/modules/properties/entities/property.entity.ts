import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PropertyImage } from './propertyImage.entity';

@Entity('dhulera_properties')
export class Property {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ name: 'property_name', type: 'varchar', length: 255 })
  propertyName!: string;

  @Column({
    name: 'property_min_price',
    type: 'decimal',
    precision: 14,
    scale: 2,
    nullable: true,
  })
  propertyMinPrice!: number | null;

  @Column({
    name: 'property_max_price',
    type: 'decimal',
    precision: 14,
    scale: 2,
    nullable: true,
  })
  propertyMaxPrice!: number | null;

  @Column({ name: 'property_address', type: 'text', nullable: true })
  propertyAddress!: string | null;

  @Column({ name: 'property_lattitude', type: 'varchar', length: 100, nullable: true })
  propertyLattitude!: string | null;

  @Column({ name: 'property_longitude', type: 'varchar', length: 100, nullable: true })
  propertyLongitude!: string | null;

  @Column({ name: 'property_status', type: 'varchar', length: 50, nullable: true })
  propertyStatus!: string;

  @Column({ name: 'property_description', type: 'text', nullable: true })
  propertyDescription!: string | null;

  @Column({ name: 'property_area', type: 'varchar', length: 100, nullable: true })
  propertyArea!: string | null;

  // @Column({ name: 'property_image', type: 'text', nullable: true })
  // propertyImage!: string | null;

  @Column({ name: 'tp_id', type: 'bigint', nullable: true })
  tpId!: string | null;

  @Column({ name: 'sir_id', type: 'bigint', nullable: true })
  sirId!: string | null;

  @Column({ name: 'listing_type_id', type: 'bigint', nullable: true })
  listingTypeId!: string | null;

  @Column({ name: "property_gif_video", type: "text", nullable: true })
  propertyGifVideo!: string | null;

  @Column({ name: 'property_created_by_type', type: 'varchar', length: 100, nullable: true })
  propertyCreatedByType!: string | null;

  @Column({ name: "old_survey", type: "text", nullable: true })
  oldSurvey!: string | null;

  @Column({ name: "new_survey", type: "text", nullable: true })
  newSurvey!: string | null;

  @Column({ name: "zone", type: "text", nullable: true })
  zone!: string | null;

  @Column({ name: "road_width", type: "text", nullable: true })
  roadWidth!: string | null;

  @Column({ name: 'property_broucher', type: 'text', nullable: true })
  propertyBroucher!: string | null;

  @Column({ name: 'created_by', type: 'bigint', nullable: true })
  createdBy!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @Column({ name: 'updated_by', type: 'bigint', nullable: true })
  updatedBy!: string | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt!: Date | null;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @Column({ name: 'status', type: 'enum', enum: ['ACTIVE', 'INACTIVE', 'DELETED'], default: 'ACTIVE' })
  status!: 'ACTIVE' | 'INACTIVE' | 'DELETED';

  // Relation: one property has many images in dhulera_properties_images
  @OneToMany(() => PropertyImage, (image) => image.property, { cascade: false, eager: false })
  images!: PropertyImage[];
}