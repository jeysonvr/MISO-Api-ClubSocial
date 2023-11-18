import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MemberModule } from './member/member.module';
import { ClubModule } from './club/club.module';
import { MemberEntity } from './member/member.entity';
import { ClubEntity } from './club/club.entity';
import { ClubMemberModule } from './club-member/club-member.module';

@Module({
  imports: [MemberModule, ClubModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'admin',
      database: 'club',
      entities: [MemberEntity, ClubEntity],
      dropSchema: true,
      synchronize: true,
      keepConnectionAlive: true
    }),
    ClubMemberModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
