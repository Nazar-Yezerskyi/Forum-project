import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LikesService {
    constructor(private prisma: PrismaService){}

    private async findLikePost(userId: number, postId: number){
        const likePost = await this.prisma.post_likes.findFirst({
            where:{
                userId,
                postId
            }
        })
        return likePost;
    }

    private async findLikeById(id: number){
        const likePost = await this.prisma.post_likes.findUnique({
            where:{
                id
            }
        })
        return likePost;
    }

    private async addLikePost(userId: number, postId: number){
        const findLike = await this.findLikePost(userId, postId)
        if(findLike){
           throw new BadRequestException('You can only put like once'); 
        }
        const likePost = await this.prisma.post_likes.create({
            data:{
                userId,
                postId
            }
        });
        return likePost;
    }

    private async deleteLikePost(id: number, userId: number){
        const likePost = await this.findLikeById(id);
        if(likePost.userId !== userId){
            throw new ForbiddenException('You can only delete your own like');
        }
        if(!likePost){
            throw new NotFoundException("Like not found")
        }
        const deletedLike = await this.prisma.post_likes.delete({
            where:{
                id
            }
        });
        return deletedLike
    }

    private async findLikeComment(userId: number, commentId: number){
        const likeComment = await this.prisma.comment_likes.findFirst({
            where:{
                userId,
                commentsId:commentId
            }
        });
        return likeComment;
      
    }

    private async findLikeCommentById(id: number){
        const likeComment = await this.prisma.comment_likes.findUnique({
            where:{
                id
            }
        })
        return likeComment;
    }

    private async addLikeComment(userId: number, commentsId: number,){
        const findLikeComment = await this.findLikeComment(userId, commentsId)
        if(findLikeComment){
            throw new BadRequestException('You can only put like once'); 
        }
        const addLike = await this.prisma.comment_likes.create({
            data:{
                userId,
                commentsId
            }
        })
        return addLike;
    }

    private async deleteLikeComment(id: number, userId: number){
        const findLikeComment = await this.findLikeCommentById(id);
        if(findLikeComment.userId !== userId){
            throw new ForbiddenException('You can only delete your own like');
        }
        if(!findLikeComment){
            throw new NotFoundException("Like not found")
        }
        const deletedLike = await this.prisma.comment_likes.delete({
            where:{
                id
            }
        });
        return deletedLike
    }

    async addLike(ref: string, userId: number, id: number){
        if(ref !=='post' && ref !== 'comment'){
            throw new BadRequestException("Ivalid ref type");
        }

        if(ref === 'post'){
            const addLikePost = await this.addLikePost(userId,id)
            return addLikePost;
        }

        if(ref === 'comment'){

            const addLikeComment = await this.addLikeComment(userId,id)
            return addLikeComment;
        }
    }

    async deleteLike(ref: string, userId: number, id: number){

        if(ref !=='delete-post' && ref !== 'delete-comment'){
            throw new BadRequestException("Ivalid ref type");
        }

        if(ref === 'delete-post'){
            const deletedLikePost = await this.deleteLikePost(id, userId)
            return deletedLikePost;
        }

        if(ref === 'delete-comment'){
            const deletedLikeComment = await this.deleteLikeComment(id, userId)
            return deletedLikeComment;
        }
    }
}
