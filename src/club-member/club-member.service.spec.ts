import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';
import { Repository } from 'typeorm';

import { TypeOrmTestingConfig } from '../shared/testing-utils/testing-config';
import { ClubEntity } from '../club/club.entity';
import { MemberEntity } from '../member/member.entity';

import { ClubMemberService } from './club-member.service';

describe('ClubMemberService', () => {
  let service: ClubMemberService;
  let clubRepository: Repository<ClubEntity>;
  let memberRepository: Repository<MemberEntity>;
  let club: ClubEntity;
  let membersList: MemberEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ClubMemberService],
    }).compile();

    service = module.get<ClubMemberService>(ClubMemberService);
    clubRepository = module.get<Repository<ClubEntity>>(getRepositoryToken(ClubEntity));
    memberRepository = module.get<Repository<MemberEntity>>(getRepositoryToken(MemberEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    memberRepository.clear();
    clubRepository.clear();

    membersList = [];
    for (let i = 0; i < 5; i++) {
      const member: MemberEntity = await memberRepository.save({
        userName: faker.internet.userName(),
        email: faker.internet.email(),
        birthdate: faker.date.birthdate(),
      })
      membersList.push(member);
    }

    club = await clubRepository.save({
      name: faker.company.name(),
      foundationDate: faker.date.birthdate(),
      image: faker.lorem.slug(),
      description: faker.lorem.paragraphs().slice(0, 99),
      members: membersList
    });
  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('addMemberToClub should add an member to a club', async () => {
    const newMember: MemberEntity = await memberRepository.save({
      userName: faker.internet.userName(),
      email: faker.internet.email(),
      birthdate: faker.date.birthdate(),
    });

    const newClub: ClubEntity = await clubRepository.save({
      name: faker.company.name(),
      foundationDate: faker.date.past(),
      image: faker.lorem.slug(),
      description: faker.lorem.paragraphs().slice(0, 99),
    })

    const result: ClubEntity = await service.addMemberToClub(newClub.id, newMember.id);

    expect(result.members.length).toBe(1);
    expect(result.members[0]).not.toBeNull();
    expect(result.members[0].userName).toBe(newMember.userName)
    expect(result.members[0].email).toBe(newMember.email)
    expect(result.members[0].birthdate).toStrictEqual(newMember.birthdate)
  });

  it('addMemberToClub should thrown exception for an invalid member', async () => {
    const newClub: ClubEntity = await clubRepository.save({
      name: faker.company.name(),
      foundationDate: faker.date.birthdate(),
      image: faker.lorem.slug(),
      description: faker.lorem.paragraphs().slice(0, 99),
    })

    await expect(() => service.addMemberToClub(newClub.id, "0")).rejects.toHaveProperty("message", "The member with the given id was not found");
  });

  it('addMemberToClub should throw an exception for an invalid club', async () => {
    const newMember: MemberEntity = await memberRepository.save({
      userName: faker.internet.userName(),
      email: faker.internet.email(),
      birthdate: faker.date.birthdate(),
    });

    await expect(() => service.addMemberToClub("0", newMember.id)).rejects.toHaveProperty("message", "The club with the given id was not found");
  });

  it('findMemberFromClub should return member by club', async () => {
    const member: MemberEntity = membersList[0];
    const storedMember: MemberEntity = await service.findMemberFromClub(club.id, member.id,)
    expect(storedMember).not.toBeNull();
    expect(storedMember.userName).toBe(member.userName);
    expect(storedMember.email).toBe(member.email);
    expect(storedMember.birthdate).toStrictEqual(member.birthdate);
  });

  it('findMemberFromClub should throw an exception for an invalid member', async () => {
    await expect(() => service.findMemberFromClub(club.id, "0")).rejects.toHaveProperty("message", "The member with the given id was not found");
  });

  it('findMemberFromClub should throw an exception for an invalid club', async () => {
    const member: MemberEntity = membersList[0];
    await expect(() => service.findMemberFromClub("0", member.id)).rejects.toHaveProperty("message", "The club with the given id was not found");
  });

  it('findMemberFromClub should throw an exception for an member not associated to the club', async () => {
    const newMember: MemberEntity = await memberRepository.save({
      userName: faker.internet.userName(),
      email: faker.internet.email(),
      birthdate: faker.date.birthdate(),
    });

    await expect(() => service.findMemberFromClub(club.id, newMember.id)).rejects.toHaveProperty("message", "The member with the given id is not associated to the club");
  });

  it('findMembersFromClub should return members by club', async () => {
    const members: MemberEntity[] = await service.findMembersFromClub(club.id);
    expect(members.length).toBe(5)
  });

  it('findMembersFromClub should throw an exception for an invalid club', async () => {
    await expect(() => service.findMembersFromClub("0")).rejects.toHaveProperty("message", "The club with the given id was not found");
  });

  it('updateMembersFromClub should update members list for a club', async () => {
    const newMember: MemberEntity = await memberRepository.save({
      userName: faker.internet.userName(),
      email: faker.internet.email(),
      birthdate: faker.date.birthdate(),
    });

    const updatedClub: ClubEntity = await service.updateMembersFromClub(club.id, [newMember]);
    expect(updatedClub.members.length).toBe(1);

    expect(updatedClub.members[0].userName).toBe(newMember.userName);
    expect(updatedClub.members[0].email).toBe(newMember.email);
    expect(updatedClub.members[0].birthdate).toBe(newMember.birthdate);
  });

  it('updateMembersFromClub should throw an exception for an invalid club', async () => {
    const newMember: MemberEntity = await memberRepository.save({
      userName: faker.internet.userName(),
      email: faker.internet.email(),
      birthdate: faker.date.birthdate(),
    });

    await expect(() => service.updateMembersFromClub("0", [newMember])).rejects.toHaveProperty("message", "The club with the given id was not found");
  });

  it('updateMembersFromClub should throw an exception for an invalid member', async () => {
    const newMember: MemberEntity = membersList[0];
    newMember.id = "0";

    await expect(() => service.updateMembersFromClub(club.id, [newMember])).rejects.toHaveProperty("message", "The member with the given id was not found");
  });

  it('deleteMemberToClub should remove an member from a club', async () => {
    const member: MemberEntity = membersList[0];

    await service.deleteMemberFromClub(club.id, member.id);

    const storedClub: ClubEntity = await clubRepository.findOne({ where: { id: club.id }, relations: ["members"] });
    const deletedMember: MemberEntity = storedClub.members.find(a => a.id === member.id);

    expect(deletedMember).toBeUndefined();
  });

  it('deleteMemberToClub should thrown an exception for an invalid member', async () => {
    await expect(() => service.deleteMemberFromClub(club.id, "0")).rejects.toHaveProperty("message", "The member with the given id was not found");
  });

  it('deleteMemberToClub should thrown an exception for an invalid club', async () => {
    const member: MemberEntity = membersList[0];
    await expect(() => service.deleteMemberFromClub("0", member.id)).rejects.toHaveProperty("message", "The club with the given id was not found");
  });

  it('deleteMemberToClub should thrown an exception for an non asocciated member', async () => {
    const newMember: MemberEntity = await memberRepository.save({
      userName: faker.internet.userName(),
      email: faker.internet.email(),
      birthdate: faker.date.birthdate(),
    });

    await expect(() => service.deleteMemberFromClub(club.id, newMember.id)).rejects.toHaveProperty("message", "The member with the given id is not associated to the club");
  });
});
