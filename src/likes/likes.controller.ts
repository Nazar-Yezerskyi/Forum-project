import { Controller, Delete, Param, Post, Request, UseGuards } from '@nestjs/common';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Controller('likes')
export class LikesController {
    constructor(private likesService: LikesService){}

    @Post('/:ref/:id')
    @UseGuards(JwtAuthGuard)
    async addLike(@Param('ref') ref: string, @Param('id') id: string, @Request() req){
        const userId = req.user.userId;
        return await this.likesService.addLike(ref,+userId,+id)
    }

    @Delete('/:ref/:id')
    @UseGuards(JwtAuthGuard)
    async deleteLike(@Param('ref') ref: string, @Param('id') id: string, @Request() req){
        const userId = req.user.userId;
        return await this.likesService.deleteLike(ref,userId,+id)
       
    }

}
