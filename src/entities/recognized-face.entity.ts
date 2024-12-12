import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Estate } from './estate.entity';
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
  idCode: string; // Store face identifier code

  @Column({ type: 'varchar', length: 255, nullable: true })
  imageUrl: string; // Store reference to face image

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Estate, (estate) => estate.recognizedFaces, {
    nullable: false,
  })
  estate: Estate;
}
