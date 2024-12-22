import { Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { FollowersService } from './followers.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Controller('followers')
export class FollowersController {
    constructor(private followersService: FollowersService){}

    @Get()
    @UseGuards(JwtAuthGuard)
    async getFollowers(@Request() req){
        const userId = req.user.userId;
        return await this.followersService.getFollowers(userId);

    }
    @Get('/following')
    @UseGuards(JwtAuthGuard)
    async getFollowing(@Request() req){
        const userId = req.user.userId;
        return await this.followersService.getFollowing(userId)
    }

    @Post('/follow/:followingId')
    @UseGuards(JwtAuthGuard)
    async followUser(@Param('followingId') followingId: string, @Request() req){
        const followedById =  req.user.userId;
        return await this.followersService.followUser(followedById,+followingId)
    }

    @Delete('/unfollow/:followingId')
    @UseGuards(JwtAuthGuard)
    async unFollowUser(@Param('followingId') followingId: string, @Request() req){
        const followedById =  req.user.userId;
        return await this.followersService.unFollowUser(followedById,+followingId);
    }
}
