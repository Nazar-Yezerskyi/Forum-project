import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Controller('messages')
export class MessagesController {

    constructor( private messagesService: MessagesService){}

    @Get(':chatId')
    @UseGuards(JwtAuthGuard)
    async getMessages(@Param('chatId') chatId: string, @Request() req){
        const userId = req.user.userId;
        const getMessages = this.messagesService.getMessage(+chatId, userId)
        return getMessages;
    }
}
