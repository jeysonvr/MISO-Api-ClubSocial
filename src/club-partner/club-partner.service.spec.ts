import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';
import { Repository } from 'typeorm';

import { TypeOrmTestingConfig } from '../shared/testing-utils/testing-config';
import { ClubEntity } from '../club/club.entity';
import { PartnerEntity } from '../partner/partner.entity';

import { ClubPartnerService } from './club-partner.service';

describe('ClubPartnerService', () => {
  let service: ClubPartnerService;
  let clubRepository: Repository<ClubEntity>;
  let partnerRepository: Repository<PartnerEntity>;
  let club: ClubEntity;
  let partnersList: PartnerEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ClubPartnerService],
    }).compile();

    service = module.get<ClubPartnerService>(ClubPartnerService);
    clubRepository = module.get<Repository<ClubEntity>>(getRepositoryToken(ClubEntity));
    partnerRepository = module.get<Repository<PartnerEntity>>(getRepositoryToken(PartnerEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    partnerRepository.clear();
    clubRepository.clear();

    partnersList = [];
    for (let i = 0; i < 5; i++) {
      const partner: PartnerEntity = await partnerRepository.save({
        userName: faker.internet.userName(),
        email: faker.internet.email(),
        birthdate: faker.date.birthdate(),
      })
      partnersList.push(partner);
    }

    club = await clubRepository.save({
      name: faker.company.name(),
      foundationDate: faker.date.birthdate(),
      image: faker.lorem.slug(),
      description: faker.lorem.paragraphs().slice(0, 99),
      partners: partnersList
    });
  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('addPartnerClub should add an partner to a club', async () => {
    const newPartner: PartnerEntity = await partnerRepository.save({
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

    const result: ClubEntity = await service.addPartnerClub(newClub.id, newPartner.id);

    expect(result.partners.length).toBe(1);
    expect(result.partners[0]).not.toBeNull();
    expect(result.partners[0].userName).toBe(newPartner.userName)
    expect(result.partners[0].email).toBe(newPartner.email)
    expect(result.partners[0].birthdate).toStrictEqual(newPartner.birthdate)
  });

  it('addPartnerClub should thrown exception for an invalid partner', async () => {
    const newClub: ClubEntity = await clubRepository.save({
      name: faker.company.name(),
      foundationDate: faker.date.birthdate(),
      image: faker.lorem.slug(),
      description: faker.lorem.paragraphs().slice(0, 99),
    })

    await expect(() => service.addPartnerClub(newClub.id, "0")).rejects.toHaveProperty("message", "The partner with the given id was not found");
  });

  it('addPartnerClub should throw an exception for an invalid club', async () => {
    const newPartner: PartnerEntity = await partnerRepository.save({
      userName: faker.internet.userName(),
      email: faker.internet.email(),
      birthdate: faker.date.birthdate(),
    });

    await expect(() => service.addPartnerClub("0", newPartner.id)).rejects.toHaveProperty("message", "The club with the given id was not found");
  });

  it('findPartnerByClubIdPartnerId should return partner by club', async () => {
    const partner: PartnerEntity = partnersList[0];
    const storedPartner: PartnerEntity = await service.findPartnerByClubIdPartnerId(club.id, partner.id,)
    expect(storedPartner).not.toBeNull();
    expect(storedPartner.userName).toBe(partner.userName);
    expect(storedPartner.email).toBe(partner.email);
    expect(storedPartner.birthdate).toStrictEqual(partner.birthdate);
  });

  it('findPartnerByClubIdPartnerId should throw an exception for an invalid partner', async () => {
    await expect(() => service.findPartnerByClubIdPartnerId(club.id, "0")).rejects.toHaveProperty("message", "The partner with the given id was not found");
  });

  it('findPartnerByClubIdPartnerId should throw an exception for an invalid club', async () => {
    const partner: PartnerEntity = partnersList[0];
    await expect(() => service.findPartnerByClubIdPartnerId("0", partner.id)).rejects.toHaveProperty("message", "The club with the given id was not found");
  });

  it('findPartnerByClubIdPartnerId should throw an exception for an partner not associated to the club', async () => {
    const newPartner: PartnerEntity = await partnerRepository.save({
      userName: faker.internet.userName(),
      email: faker.internet.email(),
      birthdate: faker.date.birthdate(),
    });

    await expect(() => service.findPartnerByClubIdPartnerId(club.id, newPartner.id)).rejects.toHaveProperty("message", "The partner with the given id is not associated to the club");
  });

  it('findPartnersByClubId should return partners by club', async () => {
    const partners: PartnerEntity[] = await service.findPartnersByClubId(club.id);
    expect(partners.length).toBe(5)
  });

  it('findPartnersByClubId should throw an exception for an invalid club', async () => {
    await expect(() => service.findPartnersByClubId("0")).rejects.toHaveProperty("message", "The club with the given id was not found");
  });

  it('associatePartnersClub should update partners list for a club', async () => {
    const newPartner: PartnerEntity = await partnerRepository.save({
      userName: faker.internet.userName(),
      email: faker.internet.email(),
      birthdate: faker.date.birthdate(),
    });

    const updatedClub: ClubEntity = await service.associatePartnersClub(club.id, [newPartner]);
    expect(updatedClub.partners.length).toBe(1);

    expect(updatedClub.partners[0].userName).toBe(newPartner.userName);
    expect(updatedClub.partners[0].email).toBe(newPartner.email);
    expect(updatedClub.partners[0].birthdate).toBe(newPartner.birthdate);
  });

  it('associatePartnersClub should throw an exception for an invalid club', async () => {
    const newPartner: PartnerEntity = await partnerRepository.save({
      userName: faker.internet.userName(),
      email: faker.internet.email(),
      birthdate: faker.date.birthdate(),
    });

    await expect(() => service.associatePartnersClub("0", [newPartner])).rejects.toHaveProperty("message", "The club with the given id was not found");
  });

  it('associatePartnersClub should throw an exception for an invalid partner', async () => {
    const newPartner: PartnerEntity = partnersList[0];
    newPartner.id = "0";

    await expect(() => service.associatePartnersClub(club.id, [newPartner])).rejects.toHaveProperty("message", "The partner with the given id was not found");
  });

  it('deletePartnerToClub should remove an partner from a club', async () => {
    const partner: PartnerEntity = partnersList[0];

    await service.deletePartnerClub(club.id, partner.id);

    const storedClub: ClubEntity = await clubRepository.findOne({ where: { id: club.id }, relations: ["partners"] });
    const deletedPartner: PartnerEntity = storedClub.partners.find(a => a.id === partner.id);

    expect(deletedPartner).toBeUndefined();
  });

  it('deletePartnerToClub should thrown an exception for an invalid partner', async () => {
    await expect(() => service.deletePartnerClub(club.id, "0")).rejects.toHaveProperty("message", "The partner with the given id was not found");
  });

  it('deletePartnerToClub should thrown an exception for an invalid club', async () => {
    const partner: PartnerEntity = partnersList[0];
    await expect(() => service.deletePartnerClub("0", partner.id)).rejects.toHaveProperty("message", "The club with the given id was not found");
  });

  it('deletePartnerToClub should thrown an exception for an non asocciated partner', async () => {
    const newPartner: PartnerEntity = await partnerRepository.save({
      userName: faker.internet.userName(),
      email: faker.internet.email(),
      birthdate: faker.date.birthdate(),
    });

    await expect(() => service.deletePartnerClub(club.id, newPartner.id)).rejects.toHaveProperty("message", "The partner with the given id is not associated to the club");
  });
});
