import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';

import { TypeOrmTestingConfig } from '../shared/testing-utils/testing-config';
import { MemberService } from './member.service';
import { MemberEntity } from './member.entity';

describe('MemberService', () => {
  let service: MemberService;
  let repository: Repository<MemberEntity>;
  let membersList: MemberEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [MemberService],
    }).compile();

    service = module.get<MemberService>(MemberService);
    repository = module.get<Repository<MemberEntity>>(getRepositoryToken(MemberEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    membersList = [];
    for (let i = 0; i < 5; i++) {
      const member: MemberEntity = await repository.save({
        userName: faker.internet.userName(),
        email: faker.internet.email(),
        birthdate: faker.date.birthdate(),
      })
      membersList.push(member);
    }
  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all members', async () => {
    const members: MemberEntity[] = await service.findAll();
    expect(members).not.toBeNull();
    expect(members).toHaveLength(membersList.length);
  });

  it('findOne should return a member by id', async () => {
    const storedMember: MemberEntity = membersList[0];
    const member: MemberEntity = await service.findOne(storedMember.id);
    expect(member).not.toBeNull();
    expect(member.userName).toEqual(storedMember.userName)
    expect(member.email).toEqual(storedMember.email)
    expect(member.birthdate).toEqual(storedMember.birthdate)
  });

  it('findOne should throw an exception for an invalid member', async () => {
    await expect(() => service.findOne("0")).rejects.toHaveProperty("message", "The member with the given id was not found")
  });

  it('create should return a new member', async () => {
    const member: MemberEntity = {
      id: "",
      userName: faker.internet.userName(),
      email: faker.internet.email(),
      birthdate: faker.date.birthdate(),
    }

    const newMember: MemberEntity = await service.create(member);
    expect(newMember).not.toBeNull();

    const storedMember: MemberEntity = await repository.findOne({ where: { id: newMember.id } })
    expect(storedMember).not.toBeNull();
    expect(storedMember.userName).toEqual(newMember.userName)
    expect(storedMember.email).toEqual(newMember.email)
    expect(storedMember.birthdate).toEqual(newMember.birthdate)
  });

  it('create should throw an exception for an invalid member email', async () => {
    const member: MemberEntity = {
      id: "",
      userName: faker.internet.userName(),
      email: 'invalidEmail',
      birthdate: faker.date.birthdate(),
    }

    await expect(() => service.create(member)).rejects.toHaveProperty("message", "The email is not valid")
  });

  it('update should modify a member', async () => {
    const member: MemberEntity = membersList[0];
    member.userName = "NewUserName";
    member.email = "newEmail@email.com";
    member.birthdate = new Date();
    const updatedMember: MemberEntity = await service.update(member.id, member);
    expect(updatedMember).not.toBeNull();
    const storedMember: MemberEntity = await repository.findOne({ where: { id: member.id } })
    expect(storedMember).not.toBeNull();
    expect(storedMember.userName).toEqual(member.userName)
    expect(storedMember.email).toEqual(member.email)
    expect(storedMember.birthdate).toEqual(member.birthdate)
  });

  it('update should throw an exception for an invalid member email', async () => {
    const member: MemberEntity = membersList[0];
    member.userName = faker.internet.userName();
    member.email = 'invalidEmail';
    member.birthdate = faker.date.birthdate();

    await expect(() => service.update(member.id, member)).rejects.toHaveProperty("message", "The email is not valid")
  });

  it('delete should remove a member', async () => {
    const member: MemberEntity = membersList[0];
    await service.delete(member.id);
    const deletedMember: MemberEntity = await repository.findOne({ where: { id: member.id } })
    expect(deletedMember).toBeNull();
  });

  it('delete should throw an exception for an invalid member', async () => {
    await expect(() => service.delete("0")).rejects.toHaveProperty("message", "The member with the given id was not found")
  });
});
