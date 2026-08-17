import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { PropertyStatus, PropertyType, PropertyZone } from '../../../common/enums/property.enum';

@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'enum', enum: PropertyZone })
  zone: PropertyZone;

  @Column({ type: 'enum', enum: PropertyType })
  type: PropertyType;

  @Column({ nullable: true })
  village: string;

  @Column({ nullable: true })
  sector: string;

  @Column({ nullable: true })
  tpScheme: string;

  @Column({ nullable: true })
  fpNumber: string;

  @Column({ nullable: true })
  surveyNumber: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  area: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  price: number;

  @Column({ type: 'enum', enum: PropertyStatus, default: PropertyStatus.AVAILABLE })
  status: PropertyStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}