import { Injectable, NotFoundException } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatsService } from 'src/chats/chats.service';
import { MessagesService } from 'src/messages/messages.service';


@Injectable()
@WebSocketGateway()
export class ChatGatewayService implements OnGatewayConnection, OnGatewayDisconnect {
    
    constructor(
        private chatService: ChatsService,
        private messageService: MessagesService
        ){}
    
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

        const chatId = payload?.chatId;
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

        const encryptedMessage = this.messageService.encrypt(message)
        
        const savedMessage = await this.messageService.addMessage(userId,+chatId,encryptedMessage)
        if (!chatId || !message) {
            console.error('Message or Chat ID is undefined or missing!');
            client.emit('error', { message: 'Message and Chat ID are required.' });
            return;
        }

        this.server.to(chatId).emit('getMessage', { user: client.id, encryptedMessage });
        console.log(`Client ${client.id} sent message to chat ${chatId}: ${encryptedMessage}`);

    }
    @SubscribeMessage('getMessage')
    async getMessage(client: Socket, payload: any) {
        payload = JSON.parse(payload);
        const chatId = payload?.chatId;
        const encryptedMessage = payload?.message

        if (!chatId || !encryptedMessage) {
            console.error('Message or Chat ID is undefined or missing!');
            client.emit('error', { message: 'Message and Chat ID are required.' });
            return;
        }

        const decryptedMessage = this.messageService.decrypt(encryptedMessage)
       
        this.server.to(chatId).emit('receiveMessage', { user: client.id, decryptedMessage });
    }

    @SubscribeMessage('editMessage')
    async editMessage(client: Socket, payload:any){
        payload = JSON.parse(payload);
        const chatId = payload?.chatId;
        const userId = payload?.userId;
        const messageId = payload?.messageId;
        const updatedMessage = payload?.updatedMessage

        if (!chatId || !messageId || !updatedMessage ) {
            console.error('Message or Chat ID or messageId is undefined or missing!');
            client.emit('error', { message: 'Message or Chat ID or messageId are required.' });
            return;
        }
        const editedMessage = await this.messageService.updateMessage(messageId,userId,+chatId, updatedMessage)
        this.server.to(chatId).emit('messageEdited', { user: userId, messageId: editedMessage, updatedMessage });
    }

    @SubscribeMessage('deleteMessage')
    async deleteMessage(client: Socket, payload: any){
        payload = JSON.parse(payload);
        const chatId = payload?.chatId;
        const userId = payload?.userId;
        const messageId = payload?.messageId;
        
        if (!chatId || !messageId || !userId ) {
            console.error('Message or Chat ID or userID is undefined or missing!');
            client.emit('error', { message: 'Message or Chat ID or userID are required.' });
            return;
        }
        
        const deletedMessage = await this.messageService.deleteMessage(messageId,userId,+chatId)
        this.server.to(chatId).emit('messageDeleted', {user: userId, messageId: deletedMessage.id})
    }
}
