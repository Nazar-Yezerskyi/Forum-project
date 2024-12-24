import { Module } from '@nestjs/common';
import { ActionsController } from './actions.controller';
import { ActionsService } from './actions.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports:[PrismaModule,JwtModule],
  controllers: [ActionsController],
  providers: [ActionsService],
  exports: [ActionsService]
})
export class ActionsModule {}
