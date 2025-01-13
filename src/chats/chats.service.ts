import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatsService {
    constructor(private prisma: PrismaService){}

   async  findOne(id: number){
        const chat = await this.prisma.chats.findUnique({
            where: {
                id
            },
        })
        return chat;
    }

    private async findByUsers(user1: number, user2: number){
        const chat = await this.prisma.chats.findFirst({
            where:{
                isGroupChat: false,
                participants:{
                    every:{
                        userId:{
                            in: [user1,user2]
                        }
                    }
                }
            }
        })
        return chat;
    }

   async createPrivateChat(createrUserId: number, connectedUserId: number){
        const findChat = await this.findByUsers(createrUserId, connectedUserId);
        if(findChat){
            throw new ConflictException('Chat between these users already exists.');
        }
        const chat = await this.prisma.chats.create({
            data:{
                participants:{
                    create: [
                        {userId: createrUserId},
                        {userId: connectedUserId}
                    ]
                }
            }
        })
        return chat;
    }

    private formatParticipantsForChat(createrUserId: number, usersId: number[]){
        const participants = [
            { user: { connect: { id: createrUserId } } },
            ...usersId.map(userId => ({ user: { connect: { id: userId } } })),
        ];
        return participants;
    }

    async createGroupChat(createrUserId: number, usersId :number[], chatName?: string){
        const participants = this.formatParticipantsForChat(createrUserId,usersId)
        const group = await this.prisma.chats.create({
            data:{
                name: chatName ?? 'Unnamed Group',
                isGroupChat: true,
                participants:{
                    create: participants
                }
            },  
            include: {
                participants: true,
            },          
        })
        return group;
    }

    private async getExistingGroupParticipants(usersId: number[], chatId: number) {
        const existingParticipants = await this.prisma.chatParticipants.findMany({
            where: {
                chatId: chatId,
                userId: { in: usersId },
            },
            select: { userId: true }, 
        });
    
        return existingParticipants.map(participant => participant.userId);
    }
    
    async addUserToGroup(createrUserId: number, usersId: number[], chatId: number) {
        const chatExists = await this.findOne(chatId);

        if (!chatExists) {
            throw new NotFoundException(`Chat with ID ${chatId} does not exist.`);
        }
    
        const existingUserIds = await this.getExistingGroupParticipants(usersId, chatId);
        const newUsers = usersId.filter(userId => !existingUserIds.includes(userId));
    
        if (newUsers.length === 0) {
            return { message: "All users are already in the group" };
        }
    
        const participants = [
            { userId: createrUserId, chatId },
            ...newUsers.map(userId => ({ userId, chatId })),
        ];
    
        const addParticipants = await this.prisma.chatParticipants.createMany({
            data: participants,
        });
    
        return {addParticipants, message: `Users with Id: ${existingUserIds} already in group`};
    }
    
    async getMessage(chatId: number, userId: number){
        const isUserInChat = this.isUserInChat(userId,chatId)
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

        return chatMessages;
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

    private async isUserInChat(userId: number, chatId: number){
        const findChat = await this.findOne(chatId)
        if(!findChat){
            throw new NotFoundException(`Chat with id: ${chatId} not found`)
        }
        const isUserInChat = await this.prisma.chatParticipants.findFirst({
            where:{
                userId,
                chatId
            }
        })
        return isUserInChat;
    }

    async updateChatName(userId: number,chatId:number,chatName: string){
        const findChat = await this.isUserInChat(userId,chatId)

        if(!findChat){
            throw new ForbiddenException("You cannot update this chat. You aren't a member")
        }
        const updatedChatName = await this.prisma.chats.update({
            where:{
                id: chatId
            },
            data:{
                name: chatName
            }
        })
        return updatedChatName;
    }

    async leaveGroup(userId: number, chatId: number){
        const findGroup = await this.findOne(chatId)
        
        if(findGroup.isGroupChat === false){
            throw new ForbiddenException("This chat is not a group")
        }
        const isUserInChat = await this.isUserInChat(userId,chatId)

        if(!isUserInChat){
            throw new ForbiddenException("You aren't a member of the group")
        }

        const leaveFromGroup = await this.prisma.chatParticipants.delete({
            where:{
                id: isUserInChat.id
            }
        })

        return leaveFromGroup;
    }
}
