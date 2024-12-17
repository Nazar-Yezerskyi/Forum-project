import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PostsService {
    constructor( 
        private prisma: PrismaService,
        ){}

    
    async findAll(authorId?: number, title?: string, createdAt?: string) {
        const posts = await this.prisma.posts.findMany({
            where: {
                AND: [
                    authorId
                        ? {
                              authorId: {
                                  equals: authorId,
                              },
                          }
                        : {},
                    title
                        ? {
                              title: {
                                  contains: title,
                              },
                          }
                        : {},
                    createdAt
                        ? {
                            createdAt: {
                                gte: new Date(createdAt), 
                                lt: new Date(
                                    new Date(createdAt).setDate(new Date(createdAt).getDate() + 1)
                                ), 
                            },
                          }
                        : {},
                ],
            },
            include: {
                author: true,
            },
        });
        return posts;
    }
    async findOne(id: number){
        const post = await this.prisma.posts.findUnique({
            where:{
                id
            }
        })
        return post
    }

    async findOnePost(userId: number, postId: number, roleId: number){
        const post = await this.findOne(postId)
        if(!post){
            throw new NotFoundException('Post not found')
        }
        if(post.archived === true){
            if(roleId === 2 ||userId === post.authorId ){
                return post
            }
            throw new BadRequestException('Post archived');
        } 
    }
    
    async createPost(title: string,description: string,userId: number,image?: string ){
        const post = await this.prisma.posts.create({
            data:{
               title,
               description,
               image,
               authorId: userId
            }
        })
        return post
    }
   
    async changeArchivedStatus(id: number, archived: string, userId: number) {
        const post = await this.findOne(id);
    
        if (!post) {
            throw new NotFoundException('Post not found');
        }
    
        if (userId !== post.authorId) {
            throw new BadRequestException('You can only update your own post');
        }
    
        const isArchived = archived === 'true';
    
        return this.prisma.posts.update({
            where: { id },
            data: { archived: isArchived },
        });
    }

    async updatePost(postId: number,userId:number,title?: string,description?: string,image?: string){
        const post = await this.findOne(postId);
        if(userId !== post.authorId){
            throw new BadRequestException('You can only update your own post');
        }
        if(!post){
            throw new NotFoundException('Post not found')
        }
        const updatedpost = await this.prisma.posts.update({
            where:{
                id: postId,
            },
            data:{
                title,
                description,
                image,
                updated: new Date()
            }
        })
        return updatedpost;
    }

    async deletePost(id: number, userId: number){
        const post = await this.findOne(id)
        if(userId !== post.authorId){
            throw new BadRequestException('You can only delete your own post');
        }
        if(!post){
            throw new NotFoundException('Post not found')
        }
        const deletedPost = await this.prisma.posts.delete({
            where:{
                id
            }
        })
       return deletedPost;
    }
 
}
