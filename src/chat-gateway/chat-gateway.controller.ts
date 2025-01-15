import { Body, Controller, Post } from '@nestjs/common';
import { ChatGatewayService } from './chat-gateway.service';
import { Socket } from 'socket.io';

@Controller('chat-gateway')
export class ChatGatewayController {
    constructor(private chatGateway: ChatGatewayService){}

}
