import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ChatsModule } from 'src/chats/chats.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports:[PrismaModule, ChatsModule, JwtModule],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports:[MessagesService]
})
export class MessagesModule {}
