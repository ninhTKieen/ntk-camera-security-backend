import { ENotificationStatus } from 'src/common/common.enum';
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
export class Notification extends FullAuditedEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'varchar', nullable: false })
  body: string;

  @Column({ type: 'enum', enum: ENotificationStatus, nullable: false })
  status: ENotificationStatus;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;
}
