import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PartnerService } from './partner.service';
import { PartnerEntity } from './partner.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PartnerEntity])],
  providers: [PartnerService]
})
export class PartnerModule { }
