import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { ActionsModule } from 'src/actions/actions.module';

@Module({
  controllers: [UserController],
  providers: [UserService,JwtAuthGuard],
  imports: [PrismaModule,JwtModule, ActionsModule],
  exports: [UserService]
})
export class UserModule {}
