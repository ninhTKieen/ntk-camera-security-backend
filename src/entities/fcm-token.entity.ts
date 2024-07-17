import { EWebAppType } from 'src/common/common.enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { FullAuditedEntity } from './full-audited.entity';
import { User } from './user.entity';

@Entity('fcm_tokens')
export class FcmToken extends FullAuditedEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  token: string;

  @Column({ type: 'timestamp', nullable: false })
  date: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @Column({ type: 'varchar', nullable: true })
  language: string;

  @Column({ type: 'enum', enum: EWebAppType, nullable: false })
  webAppType: EWebAppType;
}
