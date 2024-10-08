import { EEstateType } from 'src/common/common.enum';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { EstateMember } from './estate-member.entity';
import { FullAuditedEntity } from './full-audited.entity';

@Entity('estates')
export class Estate extends FullAuditedEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'varchar', enum: EEstateType })
  type: EEstateType;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Column('simple-array', { nullable: true })
  imageUrls: string[];

  @Column('simple-array', { nullable: true })
  imageUrlIds: number[];

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  long: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  lat: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string;

  @OneToMany(() => EstateMember, (estateMember) => estateMember.estate)
  members: EstateMember[];
}
