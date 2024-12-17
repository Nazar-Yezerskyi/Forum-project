import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CommentsService {
    constructor(private prisma: PrismaService){}

    async findAllPostComments(postId: number){
        const comments = await this.prisma.comments.findMany({
            where:{
                postId 
            }
        })
        return comments;
    }

    async findOne(postId: number, commentId: number){
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
        return comment;
    }

    async updateComment(postId: number,commentId: number, content: string, userId: number){
        const comment = await this.findOne(postId, commentId)
        if(userId !== comment.userId){
            throw new BadRequestException('You can only update your own comment');
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
        return updatedComment;
    }

    async deleteComment(id: number, userId: number){
        const comment = await this.findById(id)
        if(userId !== comment.userId){
            throw new BadRequestException('You can only delete your own comment');
        }
        if(!comment){
            throw new NotFoundException("Comment not found")
        }
        const deletedComment = await this.prisma.comments.delete({
            where:{
                id
            }
        })
        return deletedComment;   
    }
}
