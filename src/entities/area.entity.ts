import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Estate } from './estate.entity';
import { FullAuditedEntity } from './full-audited.entity';

@Entity('areas')
export class Area extends FullAuditedEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @ManyToOne(() => Estate, (estate) => estate.areas, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  estate: Estate;
}
