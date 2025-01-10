import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService){}

    async findAll(){
        const categories = await this.prisma.categories.findMany();
        return categories;
    }

    async findOne(id: number){
        const category = await this.prisma.categories.findUnique({
            where:{
                id
            }
        });
        return category;
    }

    private async findByTitle(title: string){
        const category = await this.prisma.categories.findFirst({
            where:{
                title
            }
        });
        return category;
    }

    async addCategory(title: string, description?: string){
        const findCategory = await this.findByTitle(title);
        if(findCategory){
            throw new BadRequestException("Category already exist")
        }
        const addedCategory = await this.prisma.categories.create({
            data:{
                title,
                description
            }
        });
        return addedCategory;
    }

    async updateCategory(id: number, title?: string, description?: string){
        const findCategory = await this.findOne(id)
        if(!findCategory){
            throw new NotFoundException("Category not found")
        }
        const updatedCategry = await this.prisma.categories.update({
            where:{
                id
            },
            data:{
                title,
                description
            }
        });
        return updatedCategry;
    }

    async deleteCategory(id: number){
        const findCategory = await this.findOne(id)
        if(!findCategory){
            throw new NotFoundException("Category not found")
        }
        const deletedCategory = await this.prisma.categories.delete({
            where: {
                id
            }
        });
        return deletedCategory;
    }

    async findPostsByCategory(id: number){
        const findCategory = await this.findOne(id)
        if(!findCategory){
            throw new NotFoundException("Category not found")
        }
        const posts = await this.prisma.post_categories.findMany({
            where:{
                categoryId: id
            }
        })
        return posts;
    }

    private async findDataByPostIdAndCategoryId(postId: number, categoryId: number){
        const findData = await this.prisma.post_categories.findFirst({
            where:{
                postId,
                categoryId
            }
        });
        return findData
    }

    async addCategoryToPost(categoryId: number, postId: number){
        const findCategory = await this.findOne(categoryId)
        const findData = await this.findDataByPostIdAndCategoryId(postId,categoryId)
        if(findData){
            throw new BadRequestException("This category already added")
        }
        if(!findCategory){
            throw new NotFoundException("Category not found")
        }
        const addedCategory = await this.prisma.post_categories.create({
            data:{
                postId,
                categoryId
            }
        })
        return addedCategory;
    }

    async deletePostCategory(categoryId: number, postId: number){
        const findCategory = await this.findOne(categoryId)
        if(!findCategory){
            throw new NotFoundException("Category not found")
        }
        const findData = await this.findDataByPostIdAndCategoryId(postId,categoryId)
        if(!findData){
            throw new NotFoundException("Data not found")
        }
        const deleteCategory = await  this.prisma.post_categories.delete({
            where:{
                id: findData.id
            }
        })
        return deleteCategory;
    }

}
