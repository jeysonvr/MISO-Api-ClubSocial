import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';

import { TypeOrmTestingConfig } from '../shared/testing-utils/testing-config';
import { PartnerService } from './partner.service';
import { PartnerEntity } from './partner.entity';

describe('PartnerService', () => {
  let service: PartnerService;
  let repository: Repository<PartnerEntity>;
  let partnersList: PartnerEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [PartnerService],
    }).compile();

    service = module.get<PartnerService>(PartnerService);
    repository = module.get<Repository<PartnerEntity>>(getRepositoryToken(PartnerEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    partnersList = [];
    for (let i = 0; i < 5; i++) {
      const partner: PartnerEntity = await repository.save({
        userName: faker.internet.userName(),
        email: faker.internet.email(),
        birthdate: faker.date.birthdate(),
      })
      partnersList.push(partner);
    }
  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all partners', async () => {
    const partners: PartnerEntity[] = await service.findAll();
    expect(partners).not.toBeNull();
    expect(partners).toHaveLength(partnersList.length);
  });

  it('findOne should return a partner by id', async () => {
    const storedPartner: PartnerEntity = partnersList[0];
    const partner: PartnerEntity = await service.findOne(storedPartner.id);
    expect(partner).not.toBeNull();
    expect(partner.userName).toEqual(storedPartner.userName)
    expect(partner.email).toEqual(storedPartner.email)
    expect(partner.birthdate).toEqual(storedPartner.birthdate)
  });

  it('findOne should throw an exception for an invalid partner', async () => {
    await expect(() => service.findOne("0")).rejects.toHaveProperty("message", "The partner with the given id was not found")
  });

  it('create should return a new partner', async () => {
    const partner: PartnerEntity = {
      id: "",
      userName: faker.internet.userName(),
      email: faker.internet.email(),
      birthdate: faker.date.birthdate(),
    }

    const newPartner: PartnerEntity = await service.create(partner);
    expect(newPartner).not.toBeNull();

    const storedPartner: PartnerEntity = await repository.findOne({ where: { id: newPartner.id } })
    expect(storedPartner).not.toBeNull();
    expect(storedPartner.userName).toEqual(newPartner.userName)
    expect(storedPartner.email).toEqual(newPartner.email)
    expect(storedPartner.birthdate).toEqual(newPartner.birthdate)
  });

  it('create should throw an exception for an invalid partner email', async () => {
    const partner: PartnerEntity = {
      id: "",
      userName: faker.internet.userName(),
      email: 'invalidEmail',
      birthdate: faker.date.birthdate(),
    }

    await expect(() => service.create(partner)).rejects.toHaveProperty("message", "The email is not valid")
  });

  it('update should modify a partner', async () => {
    const partner: PartnerEntity = partnersList[0];
    partner.userName = "NewUserName";
    partner.email = "newEmail@email.com";
    partner.birthdate = new Date();
    const updatedPartner: PartnerEntity = await service.update(partner.id, partner);
    expect(updatedPartner).not.toBeNull();
    const storedPartner: PartnerEntity = await repository.findOne({ where: { id: partner.id } })
    expect(storedPartner).not.toBeNull();
    expect(storedPartner.userName).toEqual(partner.userName)
    expect(storedPartner.email).toEqual(partner.email)
    expect(storedPartner.birthdate).toEqual(partner.birthdate)
  });

  it('update should throw an exception for an invalid partner email', async () => {
    const partner: PartnerEntity = partnersList[0];
    partner.userName = faker.internet.userName();
    partner.email = 'invalidEmail';
    partner.birthdate = faker.date.birthdate();

    await expect(() => service.update(partner.id, partner)).rejects.toHaveProperty("message", "The email is not valid")
  });

  it('delete should remove a partner', async () => {
    const partner: PartnerEntity = partnersList[0];
    await service.delete(partner.id);
    const deletedPartner: PartnerEntity = await repository.findOne({ where: { id: partner.id } })
    expect(deletedPartner).toBeNull();
  });

  it('delete should throw an exception for an invalid partner', async () => {
    await expect(() => service.delete("0")).rejects.toHaveProperty("message", "The partner with the given id was not found")
  });
});
