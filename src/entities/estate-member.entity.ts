import { EEstateMemberStatus, EEstateRole } from 'src/common/common.enum';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Estate } from './estate.entity';
import { User } from './user.entity';

@Entity('estate_members')
export class EstateMember {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.estateMembers, { nullable: false })
  user: User;

  @ManyToOne(() => Estate, (estate) => estate.members, {
    nullable: false,
  })
  estate: Estate;

  @Column({ type: 'enum', enum: EEstateRole })
  role: EEstateRole;

  @Column({ type: 'varchar', nullable: true })
  nickname?: string;

  @Column({ type: 'enum', enum: EEstateMemberStatus, nullable: true })
  status: EEstateMemberStatus;
}
