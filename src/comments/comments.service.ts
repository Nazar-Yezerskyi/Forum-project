import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ActionsService } from 'src/actions/actions.service';
import { EntityTypes } from 'src/enums/entity-types.enum';
import { UserActions } from 'src/enums/user-actions.enum';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CommentsService {
    constructor(
        private prisma: PrismaService,
        private actionsService: ActionsService
        ){}

    async findAllPostComments(postId: number){
        const comments = await this.prisma.comments.findMany({
            where:{
                postId 
            }
        })
        return comments;
    }

    async findOne(postId: number, commentId: number, userId: number){
        const comment = await this.prisma.comments.findUnique({
            where:{
                id: commentId,
                postId
            }
        });
        const action = await this.actionsService.addAction(UserActions.VIEWED,userId,EntityTypes.COMMENT,comment.id,comment)
        return {comment, action};
    }
    private async find(postId: number, commentId: number){
        const comment = await this.prisma.comments.findUnique({
            where:{
                id: commentId,
                postId
            }
        });
        return comment;
    }

    async findById(postId: number){
        const comment = await this.prisma.comments.findUnique({
            where:{
                id:postId
            }
        })
        return comment
    }

    async createComment(postId: number,userId: number, content: string ){
        const comment = await this.prisma.comments.create({
            data:{
                postId,
                userId,
                content
            }
        });
        const action = await this.actionsService.addAction(UserActions.CREATE,userId,EntityTypes.COMMENT,comment.id,comment)
        return {comment, action};
    }

    async updateComment(postId: number,commentId: number, content: string, userId: number){
        const comment = await this.find(postId, commentId)
        if(userId !== comment.userId){
            throw new ForbiddenException('You can only update your own comment');
        }
        if(!comment){
            throw new NotFoundException("Comment not found")
        }
        const updatedComment = await this.prisma.comments.update({
            where:{
                id: commentId
            },
            data:{
                content,
                updated: new Date()
            }
        })
        const action = await this.actionsService.addAction(UserActions.UPDATE,userId,EntityTypes.COMMENT,comment.id,updatedComment)
        return {updatedComment, action};
    }

    async deleteComment(id: number, userId: number){
        const comment = await this.findById(id)
        if(userId !== comment.userId){
            throw new ForbiddenException('You can only delete your own comment');
        }
        if(!comment){
            throw new NotFoundException("Comment not found")
        }
        const deletedComment = await this.prisma.comments.delete({
            where:{
                id
            }
        })
        const action = await this.actionsService.addAction(UserActions.DELETE,userId,EntityTypes.COMMENT,comment.id,deletedComment)
        return {deletedComment, action};   
    }
}
