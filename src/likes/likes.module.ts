import { Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ActionsModule } from 'src/actions/actions.module';

@Module({
  imports:[PrismaModule,JwtModule, ActionsModule],
  providers: [LikesService],
  controllers: [LikesController]
})
export class LikesModule {}
