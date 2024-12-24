import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { UpdateCommentDto } from './dtos/update-comment.dto';

@Controller('comments')
export class CommentsController {
    constructor(private commentsService: CommentsService){}

    @Get(':postId')
    async findAllComments(@Param('postId') postId: string){
        return await this.commentsService.findAllPostComments(+postId)
    }

    @Get('/:postId/:id')
    @UseGuards(JwtAuthGuard)
    async findOne(@Param('postId') postId: string, @Param('id') id: string, @Request() req){
        const userId = req.user.userId;
        return await this.commentsService.findOne(+postId,+id,userId)
    }

    @Post(':postId')
    @UseGuards(JwtAuthGuard)
    async createComment(@Param('postId') postId: string,@Body() body: CreateCommentDto, @Request() req){
        const userId = req.user.userId;
        return await this.commentsService.createComment(+postId,userId, body.content)
    }

    @Put('/:postId/:id')
    @UseGuards(JwtAuthGuard)
    async updateComment(@Param('postId') postId: string, @Param('id') id: string,@Body() body: UpdateCommentDto,@Request() req){
        const userId = req.user.userId;
        return await this.commentsService.updateComment(+postId,+id,body.content,userId)
    }
    
    @Delete(':id')
    @UseGuards(RolesGuard)
    async deleteComment(@Param('id') id: string, @Request() req){
        const userId = req.user.userId;
        return await this.commentsService.deleteComment(+id, userId)
    }
}
