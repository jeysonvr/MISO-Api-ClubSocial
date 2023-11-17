import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TypeOrmTestingConfig } from '../shared/testing-utils/testing-config';
import { PartnerService } from './partner.service';
import { PartnerEntity } from './partner.entity';

describe('PartnerService', () => {
  let service: PartnerService;
  let repository: Repository<PartnerEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [PartnerService],
    }).compile();

    service = module.get<PartnerService>(PartnerService);
    repository = module.get<Repository<PartnerEntity>>(getRepositoryToken(PartnerEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
