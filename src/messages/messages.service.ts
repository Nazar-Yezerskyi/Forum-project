import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ChatsService } from 'src/chats/chats.service';
import { PrismaService } from 'src/prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class MessagesService {
    constructor(
        private prisma: PrismaService,
        private chatsService: ChatsService
        ){}
    
    async getMessage(chatId: number, userId: number){
        const isUserInChat = this.chatsService.isUserInChat(userId,chatId)
        if(!isUserInChat){
            throw new NotFoundException('Chat does not exist')
        }
        const chatMessages = await this.prisma.messages.findMany({
            where: {
                chatId
            },
            include:{
                sender:true
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        const decryptedMessage = chatMessages.map(message => {
            console.log(message.content)
            const decryptedMessage = this.decrypt(message.content)
            return {...message, content: decryptedMessage};
        })

        return decryptedMessage;
    }

    async addMessage(userId: number, chatId: number,message: string){
        const data = await this.prisma.messages.create({
            data:{
                content: message,
                senderId: userId,
                chatId
            }
        })
        return data; 
    }

    private async findMessage(messageId: number){
        const findMessage =  await this.prisma.messages.findUnique({
            where:{
                id: messageId
            }
        })
        return findMessage
    }

    async updateMessage(messageId: number, userId: number, chatId: number, updatedMessage: string){
        const findMessage = await this.findMessage(messageId)
        if(!findMessage){
            throw new NotFoundException("Message not found")
        }
        if(findMessage.senderId !== userId){
            throw new ForbiddenException("You cannot update a message that isn't yours")
        }
        if(findMessage.chatId !== chatId){
            throw new BadRequestException("Incorrect parameters")
        }
        const encrypted = this.encrypt(updatedMessage)
        const savedMessage = this.prisma.messages.update({
            where:{
                id: messageId
            },
            data:{
                content:encrypted
            }
        })
        return savedMessage
    }

    async deleteMessage(messageId: number, userId: number, chatId: number){
        const findMessage = await this.findMessage(messageId)
        if(!findMessage){
            throw new NotFoundException("Message not found")
        }
        if(findMessage.senderId !== userId){
            throw new ForbiddenException("You cannot update a message that isn't yours")
        }
        if(findMessage.chatId !== chatId){
            throw new BadRequestException("Incorrect parameters")
        }
        const deletedMessage = this.prisma.messages.delete({
            where:{
                id: messageId
            }
        })
        return deletedMessage
    }

    encrypt(text: string){
        const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex')
        const cipher = crypto.createCipheriv(process.env.ALGORITHM, key, null)
        let encrypted = cipher.update(text,'utf8','hex')
        encrypted += cipher.final('hex')
        return encrypted
    }

    decrypt(text: string){
        const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex')
        const decipher = crypto.createDecipheriv(process.env.ALGORITHM,key, null)
        let decrypted = decipher.update(text, 'hex', 'utf8')
        decrypted += decipher.final('utf8')
        return decrypted
    }

}
