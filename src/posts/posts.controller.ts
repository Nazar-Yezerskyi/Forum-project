import { Controller, Get, Post, Query, UseGuards, Request, Body, Patch, Param, Put, Delete} from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { CreatePostDto } from './dtos/create-post.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { RolesGuard } from 'src/guards/roles.guard';

@Controller('posts')
export class PostsController {
    constructor(private postService: PostsService){}

    @Get('')
    async findAllPosts(
        @Query('authorId') authorId?: string,
        @Query('title') title?: string,
        @Query('createdAt') createdAt?: string
    ){
       return await this.postService.findAll(+authorId,title,createdAt) 
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async findOne(@Param('id') postId: string,@Request() req){
        const userId = req.user.userId
        const roleId = req.user.roleId

        return await this.postService.findOnePost(userId,+postId,roleId)
    }

    @Patch('/:id/:status')
    @UseGuards(JwtAuthGuard)
    async updateStatus(@Param('id') id: string, @Param('status') status: string, @Request() req){
        const userId = req.user.userId
        return await this.postService.changeArchivedStatus(+id,status,userId)
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    async createPost(@Body() body: CreatePostDto,@Request() req){
        const userId = req.user.userId
        return await this.postService.createPost(body.title,body.description, userId, body.image)
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    async updatePost(@Param('id') id: string,@Body() body: UpdatePostDto,@Request() req){
        const userId = req.user.userId;
        return await this.postService.updatePost(+id,userId,body.title, body.description,body.image)
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    async deletePost(@Param('id') id: string, @Request() req){
        const userId = req.user.userId;
        return await this.postService.deletePost(+id, userId)
    }

    @Post('/:postId/categories/:categoryId')
    @UseGuards(JwtAuthGuard)
    async addCategoryToPost(@Param('postId') postId: string, @Param('categoryId') categoryId: string, @Request() req){
        const userId = req.user.userId;
        return await this.postService.addCategoryToPost(+postId,+categoryId,userId);
    }

    @Delete('/:postId/categories/:categoryId')
    @UseGuards(JwtAuthGuard)
    async deletePostCategory(@Param('postId') postId: string, @Param('categoryId') categoryId: string, @Request() req){
        const userId = req.user.userId;
        return await this.postService.deletePostCategory(+postId,+categoryId,userId)
    }
}
