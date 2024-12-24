import { Module } from '@nestjs/common';
import { FollowersService } from './followers.service';
import { FollowersController } from './followers.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ActionsModule } from 'src/actions/actions.module';

@Module({
  imports:[PrismaModule,JwtModule, ActionsModule],
  providers: [FollowersService],
  controllers: [FollowersController]
})
export class FollowersModule {}
