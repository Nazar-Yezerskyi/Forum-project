import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { AddCategoryDto } from './dtos/add-category.dto';
import { AdminGuard } from 'src/guards/admin.guard';
import { UpdateCategoryDto } from './dtos/update-category.dto';

@Controller('categories')
export class CategoriesController {
    constructor(private categoriesService: CategoriesService){}

    @Get()
    async findAll(){
        return await this.categoriesService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string){
        return await this.categoriesService.findOne(+id)
    }

    @Post()
    @UseGuards(AdminGuard)
    async addCategory(@Body() body: AddCategoryDto){
        return await this.categoriesService.addCategory(body.title, body.description)
    }

    @Put(':id')
    @UseGuards(AdminGuard)
    async updateCategory(@Param('id') id: string,@Body() body: UpdateCategoryDto ){
        return await this.categoriesService.updateCategory(+id,body.title,body.description);
    }

    @Delete(':id')
    @UseGuards(AdminGuard)
    async deleteCategory(@Param('id') id: string){
        return await this.categoriesService.deleteCategory(+id)
    }

    @Get(':id/posts')
    async findPostsByCategory(@Param('id') id: string){
        return await this.categoriesService.findPostsByCategory(+id)
    }
}
