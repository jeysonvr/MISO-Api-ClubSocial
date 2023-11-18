import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClubEntity } from '../club/club.entity';
import { MemberEntity } from '../member/member.entity';

import { ClubMemberService } from './club-member.service';

@Module({
  imports: [TypeOrmModule.forFeature([ClubEntity, MemberEntity])],
  providers: [ClubMemberService]
})
export class ClubMemberModule { }
