import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { CreatePrivateChatDto } from './dtos/create-private-chat.dto';
import { CreateGroupChatDto } from './dtos/create-group.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { AddUserToGroupDto } from './dtos/add-user-to-group.dto';
import { UpdateChatNameDto } from './dtos/update-chat-name.dto';


@Controller('chats')
export class ChatsController {
    constructor(private chatsService: ChatsService){}

    @Get(':chatId')
    @UseGuards(JwtAuthGuard)
    async getMessages(@Param('chatId') chatId: string, @Request() req){
        const userId = req.user.userId;
        const getMessages = this.chatsService.getMessage(+chatId, userId)
        return getMessages;
    }

    @Post('create-private-chat')
    @UseGuards(JwtAuthGuard)
    async createPrivateChat(@Body() body: CreatePrivateChatDto, @Request() req){
        const userId = req.user.userId;
        const chat = await this.chatsService.createPrivateChat(userId, body.connectedUserId);
        return chat
    }

    @Post('create-group')
    @UseGuards(JwtAuthGuard)
    async createGroupChat(@Body() body: CreateGroupChatDto,@Request() req){
        const userId = req.user.userId;
        const groupChat = await this.chatsService.createGroupChat(userId, body.usersId, body.chatName);
        return groupChat
    }

    @Post(':chatId/add-users')
    @UseGuards(JwtAuthGuard)
    async addUserToGroup(@Param('chatId') chatId: string, @Body() body: AddUserToGroupDto,@Request() req){
        const userId = req.user.userId;
        const result = await this.chatsService.addUserToGroup(userId, body.usersId, +chatId);
        return result;
    }

    @Patch(':chatId/updateChatName')
    @UseGuards(JwtAuthGuard)
    async updateChatName(@Body() body: UpdateChatNameDto,@Param('chatId') chatId: string, @Request() req){
        const userId = req.user.userId;
        const updatedChatName = await this.chatsService.updateChatName(userId,+chatId ,body.chatName);
        return updatedChatName;
    }

    @Delete(':chatId/leave-group')
    @UseGuards(JwtAuthGuard)
    async leaveGroup(@Param('chatId') chatId: string, @Request() req){
        const userId = req.user.userId;
        const leaveGroup = await this.chatsService.leaveGroup(userId,+chatId)
        return leaveGroup
    }
}
