import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Property } from './property.entity';

@Entity('dhulera_properties_images')
export class PropertyImage {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ name: 'property_id', type: 'bigint', nullable: true })
  propertyId!: string | null;

  @ManyToOne(() => Property, (property) => property.images, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'property_id' })
  property!: Property | null;

  @Column({ name: 'image_url', type: 'varchar', length: 500 })
  imageUrl!: string;

  @Column({ name: 'created_by', type: 'bigint', nullable: true })
  createdBy!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @Column({ name: 'updated_by', type: 'bigint', nullable: true })
  updatedBy!: string | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt!: Date | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['ACTIVE', 'INACTIVE', 'DELETED'],
    default: 'ACTIVE',
  })
  status!: 'ACTIVE' | 'INACTIVE' | 'DELETED';
}