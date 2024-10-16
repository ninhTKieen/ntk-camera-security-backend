import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Area } from './area.entity';
import { Estate } from './estate.entity';
import { FullAuditedEntity } from './full-audited.entity';

@Entity('devices')
export class Device extends FullAuditedEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255 })
  ipCamera: string;

  @Column({ nullable: true })
  rtsp: string;

  @Column({ nullable: true })
  model: string;

  @Column({ nullable: true })
  serial: string;

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  mac: string;

  @ManyToOne(() => Estate, (estate) => estate.devices, {
    nullable: false,
  })
  estate: Estate;

  @ManyToOne(() => Area, (area) => area.devices, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  area: Area;
}
