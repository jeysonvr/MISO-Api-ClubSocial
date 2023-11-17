import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

import { PartnerEntity } from '../partner/partner.entity';

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

  @ManyToMany(() => PartnerEntity, partner => partner.clubs)
  @JoinTable()
  partners?: PartnerEntity[];
}
