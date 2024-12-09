import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Device } from './device.entity';
import { FullAuditedEntity } from './full-audited.entity';

@Entity('recognized_faces')
export class RecognizedFace extends FullAuditedEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @Column({ type: 'text' })
  faceEncoding: string; // Store face encoding data

  @Column({ type: 'varchar', length: 255, nullable: true })
  imageUrl: string; // Store reference to face image

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Device, (device) => device.recognizedFaces, {
    nullable: false,
  })
  device: Device;
}
