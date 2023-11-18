import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { ClubEntity } from '../club/club.entity';
import { MemberEntity } from '../member/member.entity';

@Injectable()
export class ClubMemberService {
  constructor(
    @InjectRepository(ClubEntity)
    private readonly clubRepository: Repository<ClubEntity>,

    @InjectRepository(MemberEntity)
    private readonly memberRepository: Repository<MemberEntity>
  ) { }

  async addMemberClub(clubId: string, memberId: string): Promise<ClubEntity> {
    const member: MemberEntity = await this.memberRepository.findOne({ where: { id: memberId } });
    if (!member)
      throw new BusinessLogicException("The member with the given id was not found", BusinessError.NOT_FOUND);

    const club: ClubEntity = await this.clubRepository.findOne({ where: { id: clubId }, relations: ["members"] })
    if (!club)
      throw new BusinessLogicException("The club with the given id was not found", BusinessError.NOT_FOUND);

    club.members = [...club.members, member];
    return await this.clubRepository.save(club);
  }

  async findMemberByClubIdMemberId(clubId: string, memberId: string): Promise<MemberEntity> {
    const member: MemberEntity = await this.memberRepository.findOne({ where: { id: memberId } });
    if (!member)
      throw new BusinessLogicException("The member with the given id was not found", BusinessError.NOT_FOUND)

    const club: ClubEntity = await this.clubRepository.findOne({ where: { id: clubId }, relations: ["members"] });
    if (!club)
      throw new BusinessLogicException("The club with the given id was not found", BusinessError.NOT_FOUND)

    const clubMember: MemberEntity = club.members.find(e => e.id === member.id);

    if (!clubMember)
      throw new BusinessLogicException("The member with the given id is not associated to the club", BusinessError.PRECONDITION_FAILED)

    return clubMember;
  }

  async findMembersByClubId(clubId: string): Promise<MemberEntity[]> {
    const club: ClubEntity = await this.clubRepository.findOne({ where: { id: clubId }, relations: ["members"] });
    if (!club)
      throw new BusinessLogicException("The club with the given id was not found", BusinessError.NOT_FOUND)

    return club.members;
  }

  async associateMembersClub(clubId: string, members: MemberEntity[]): Promise<ClubEntity> {
    const club: ClubEntity = await this.clubRepository.findOne({ where: { id: clubId }, relations: ["members"] });

    if (!club)
      throw new BusinessLogicException("The club with the given id was not found", BusinessError.NOT_FOUND)

    for (let i = 0; i < members.length; i++) {
      const member: MemberEntity = await this.memberRepository.findOne({ where: { id: members[i].id } });
      if (!member)
        throw new BusinessLogicException("The member with the given id was not found", BusinessError.NOT_FOUND)
    }

    club.members = members;
    return await this.clubRepository.save(club);
  }

  async deleteMemberClub(clubId: string, memberId: string) {
    const member: MemberEntity = await this.memberRepository.findOne({ where: { id: memberId } });
    if (!member)
      throw new BusinessLogicException("The member with the given id was not found", BusinessError.NOT_FOUND)

    const club: ClubEntity = await this.clubRepository.findOne({ where: { id: clubId }, relations: ["members"] });
    if (!club)
      throw new BusinessLogicException("The club with the given id was not found", BusinessError.NOT_FOUND)

    const clubMember: MemberEntity = club.members.find(e => e.id === member.id);

    if (!clubMember)
      throw new BusinessLogicException("The member with the given id is not associated to the club", BusinessError.PRECONDITION_FAILED)

    club.members = club.members.filter(e => e.id !== memberId);
    await this.clubRepository.save(club);
  }
}
