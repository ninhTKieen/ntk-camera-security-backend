import { EGender, ERole } from 'src/common/common.enum';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { EstateMember } from './estate-member.entity';
import { FullAuditedEntity } from './full-audited.entity';

@Entity('users')
export class User extends FullAuditedEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'varchar', nullable: false })
  email: string;

  @Column({ type: 'varchar', nullable: false })
  username: string;

  @Column({ type: 'varchar', nullable: false, select: false })
  password: string;

  @Column({ type: 'varchar', nullable: true })
  phoneNumber: string;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string;

  @Column({ type: 'varchar', nullable: true })
  imageUrlId: string;

  @Column({ type: 'enum', enum: EGender, nullable: true })
  gender: EGender;

  @Column({ type: 'timestamp', nullable: true })
  dateOfBirth: Date;

  @Column({ type: 'enum', enum: ERole, nullable: false })
  role: ERole;

  @OneToMany(() => EstateMember, (estateMember) => estateMember.user)
  estateMembers: EstateMember[];
}
