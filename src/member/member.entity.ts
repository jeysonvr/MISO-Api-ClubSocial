import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

import { ClubEntity } from '../club/club.entity';

@Entity()
export class MemberEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userName: string;

  @Column()
  email: string;

  @Column()
  birthdate: Date;

  @ManyToMany(() => ClubEntity, club => club.members)
  clubs?: ClubEntity[];
}
