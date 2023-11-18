import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';

import { PartnerEntity } from './partner.entity';

@Injectable()
export class PartnerService {
  constructor(
    @InjectRepository(PartnerEntity)
    private readonly partnerRepository: Repository<PartnerEntity>
  ) { }

  async findAll(): Promise<PartnerEntity[]> {
    return await this.partnerRepository.find({ relations: ["clubs"] });
  }

  async findOne(id: string): Promise<PartnerEntity> {
    const partner: PartnerEntity = await this.partnerRepository.findOne({ where: { id }, relations: ["clubs"] });
    if (!partner)
      throw new BusinessLogicException("The partner with the given id was not found", BusinessError.NOT_FOUND);

    return partner;
  }

  async create(partner: PartnerEntity): Promise<PartnerEntity> {
    if (!partner.email.includes('@')) {
      throw new BusinessLogicException("The email is not valid", BusinessError.NOT_FOUND);
    }
    return await this.partnerRepository.save(partner);
  }

  async update(id: string, partner: PartnerEntity): Promise<PartnerEntity> {
    if (!partner.email.includes('@')) {
      throw new BusinessLogicException("The email is not valid", BusinessError.NOT_FOUND);
    }

    const persistedPartner: PartnerEntity = await this.partnerRepository.findOne({ where: { id } });
    if (!persistedPartner)
      throw new BusinessLogicException("The partner with the given id was not found", BusinessError.NOT_FOUND);

    return await this.partnerRepository.save({ ...persistedPartner, ...partner });
  }

  async delete(id: string) {
    const partner: PartnerEntity = await this.partnerRepository.findOne({ where: { id } });
    if (!partner)
      throw new BusinessLogicException("The partner with the given id was not found", BusinessError.NOT_FOUND);

    await this.partnerRepository.remove(partner);
  }
}
