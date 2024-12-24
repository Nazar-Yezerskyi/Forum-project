import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ActionsModule } from 'src/actions/actions.module';

@Module({
  imports:[PrismaModule, JwtModule, ActionsModule],
  providers: [CommentsService, JwtAuthGuard],
  controllers: [CommentsController]
})
export class CommentsModule {}
