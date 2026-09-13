import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('dhulera_properties_images')
export class PropertyImage {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id!: string;

    @Column({ name: 'propertyImage', type: 'varchar', length: 255 })
    propertyImage!: string;

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

    @Column({ name: "status", type: "enum", enum: ['ACTIVE', 'INACTIVE', "DELETED"], default: 'ACTIVE' })
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
}