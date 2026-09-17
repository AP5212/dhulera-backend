import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity("dhulera_property_tp")
export class PropertyTp {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: string;

  @Column({ type: "varchar", length: 150 })
  name: string;

  @Column({ name: 'created_by', type: 'varchar', length: 150, nullable: true })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'varchar', length: 150, nullable: true })
  updatedBy: string;

  @Column({ type: 'varchar', length: 150, default: 'ACTIVE' })
  status: string;

  @Column({ type: "boolean", default: false })
  isDeleted: boolean;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt: Date;

}
