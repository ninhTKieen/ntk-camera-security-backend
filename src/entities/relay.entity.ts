import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Estate } from './estate.entity';
import { FullAuditedEntity } from './full-audited.entity';

@Entity('relays')
export class Relay extends FullAuditedEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  port: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  uid: string;

  @ManyToOne(() => Estate, (estate) => estate.relays, {
    nullable: false,
  })
  estate: Estate;
}
