import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

import { MemberEntity } from '../member/member.entity';

@Entity()
export class ClubEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  foundationDate: Date;

  @Column()
  image: string;

  @Column()
  description: string;

  @ManyToMany(() => MemberEntity, member => member.clubs)
  @JoinTable()
  members?: MemberEntity[];
}
