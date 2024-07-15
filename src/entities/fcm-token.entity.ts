import { EFcmNotificationStatus, EWebAppType } from 'src/common/common.enum';
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

  @Column({ type: 'enum', enum: EWebAppType, nullable: false })
  webAppType: EWebAppType;

  @Column({ type: 'enum', enum: EFcmNotificationStatus, nullable: false })
  status: EFcmNotificationStatus;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;
}
