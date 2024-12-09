import { EEstateType } from 'src/common/common.enum';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Area } from './area.entity';
import { Device } from './device.entity';
import { EstateMember } from './estate-member.entity';
import { FullAuditedEntity } from './full-audited.entity';
import { RecognizedFace } from './recognized-face.entity';

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
  imageUrlIds: string[];

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  long: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  lat: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string;

  @OneToMany(() => EstateMember, (estateMember) => estateMember.estate)
  members: EstateMember[];

  @OneToMany(() => Area, (area) => area.estate)
  areas: Area[];

  @OneToMany(() => Device, (device) => device.estate)
  devices: Device[];

  @OneToMany(() => RecognizedFace, (face) => face.estate)
  recognizedFaces: RecognizedFace[];
}
