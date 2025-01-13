import { Injectable, NotFoundException } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatsService } from 'src/chats/chats.service';


@Injectable()
@WebSocketGateway()
export class ChatGatewayService implements OnGatewayConnection, OnGatewayDisconnect {
    
    constructor( private chatService: ChatsService){}
    
    @WebSocketServer()
    server: Server;

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('joinChat')
    async handleJoinChat(client: Socket, payload: any) {
        payload = JSON.parse(payload);

        const chatId = payload?.data?.chatId;
        if (!chatId) {
            console.error('Chat ID is undefined or missing!');
            client.emit('error', { message: 'Chat ID is required.' });
            return;
        }
        const findChat = await this.chatService.findOne(+chatId);
        if(!findChat){
            throw new NotFoundException(`Chat with id: ${chatId} not found`)
        }

        client.join(chatId);
        this.server.to(chatId).emit('userJoined', { userId: client.id });
        console.log(`Client ${client.id} joined chat ${chatId}`);
    }

    @SubscribeMessage('sendMessage')
    async sendMessage(client: Socket, payload: any) {
        payload = JSON.parse(payload);
        const message = payload?.message;
        const chatId = payload?.chatId;
        const userId = payload?.userId;
        
        const savedMessage = await this.chatService.addMessage(userId,+chatId,message)
        if (!chatId || !message) {
            console.error('Message or Chat ID is undefined or missing!');
            client.emit('error', { message: 'Message and Chat ID are required.' });
            return;
        }

        this.server.to(chatId).emit('getMessage', { user: client.id, message });
        console.log(`Client ${client.id} sent message to chat ${chatId}: ${message}`);
        console.log(savedMessage)
    }

}
