import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ActionsService } from 'src/actions/actions.service';
import { CategoriesService } from 'src/categories/categories.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PostsService {
    constructor( 
        private prisma: PrismaService,
        private categoryService: CategoriesService,
        private actionsService: ActionsService
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
                const action = await this.actionsService.addAction('Viewed',userId,'Post',post.id,post)
                return {post,action}
            }
            throw new NotFoundException('Post archived');
        }
        const action = await this.actionsService.addAction('Viewed',userId,'Post',post.id,post)
        return {post, action}
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
        const action = await this.actionsService.addAction('Create',userId,'Post',post.id,{title,description,image})
        return {post, action}
    }
   
    async changeArchivedStatus(id: number, archived: string, userId: number) {
        const post = await this.findOne(id);
    
        if (!post) {
            throw new NotFoundException('Post not found');
        }
    
        if (userId !== post.authorId) {
            throw new ForbiddenException('You can only update your own post');
        }
    
        const isArchived = archived === 'true';
        
        const updatedPost = await this.prisma.posts.update({
            where: { id },
            data: { archived: isArchived },
        });
        const action = await this.actionsService.addAction('Update',userId,'Post',post.id,updatedPost)
        return {updatedPost, action}
    }

    async updatePost(postId: number,userId:number,title?: string,description?: string,image?: string){
        const post = await this.findOne(postId);
        if(userId !== post.authorId){
            throw new ForbiddenException('You can only update your own post');
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
        const action = await this.actionsService.addAction('Update',userId,'Post',post.id,updatedpost);
        return {updatedpost, action};
    }

    async deletePost(id: number, userId: number){
        const post = await this.findOne(id)
        if(userId !== post.authorId){
            throw new ForbiddenException('You can only delete your own post');
        }
        if(!post){
            throw new NotFoundException('Post not found')
        }
        const deletedPost = await this.prisma.posts.delete({
            where:{
                id
            }
        })
        const action = await this.actionsService.addAction('Delete',userId,'Post',post.id,{post})
        return {deletedPost,action};
    }

    async addCategoryToPost(postId: number, categoryId: number, userId:number){
        const post = await this.findOne(postId);
        if(post.authorId !== userId){
            throw new ForbiddenException('You can only add category to your own post');
        }
        if(!post){
            throw new NotFoundException('Post not found')
        }
        const addedCategory = await this.categoryService.addCategoryToPost(categoryId,postId)
        return addedCategory;
    }

    async deletePostCategory(postId: number, categoryId: number, userId: number){
        const post = await this.findOne(postId);
        if(post.authorId !== userId){
            throw new ForbiddenException('You can only delete your own post');
        }
        if(!post){
            throw new NotFoundException('Post not found')
        }
        const deletedCategory = await this.categoryService.deletePostCategory(categoryId,postId)
        return deletedCategory;
    }
 
}
