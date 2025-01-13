import { Module } from '@nestjs/common';
import { ChatGatewayController } from './chat-gateway.controller';
import { ChatGatewayService } from './chat-gateway.service';
import { ChatsModule } from 'src/chats/chats.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [ChatsModule, JwtModule],
  controllers: [ChatGatewayController],
  providers: [ChatGatewayService]
})
export class ChatGatewayModule {}
