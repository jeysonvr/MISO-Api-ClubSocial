import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClubService } from './club.service';
import { ClubEntity } from './club.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClubEntity])],
  providers: [ClubService]
})
export class ClubModule { }
