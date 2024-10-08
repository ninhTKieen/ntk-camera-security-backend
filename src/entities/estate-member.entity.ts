import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Estate } from './estate.entity';
import { User } from './user.entity';

export enum EstateRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  NORMAL_USER = 'NORMAL_USER',
}

@Entity('estate_members')
export class EstateMember {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.estateMembers, { nullable: false })
  user: User;

  @ManyToOne(() => Estate, (estate) => estate.members, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  estate: Estate;

  @Column({ type: 'enum', enum: EstateRole, nullable: false })
  role: EstateRole;
}
