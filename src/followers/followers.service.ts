import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FollowersService {
    constructor(private prisma: PrismaService){}

    async getFollowers(userId: number){
        const followers = await this.prisma.follows.findMany({
            where:{
                followingId: userId
            }
        })
        if(!followers){
            throw new NotFoundException("You have no followers")
        }
        return followers;
    }
    async getFollowing(userId){
        const followed = await this.prisma.follows.findMany({
            where:{
                followedById: userId
            }
        })
        if(!followed){
            throw new NotFoundException("You are not following anyone")
        }
        return followed;
    }
    private async findOneFollow(followedById: number, followingId: number){
        const findFollows = await this.prisma.follows.findFirst({
            where:{
                followedById,
                followingId
            }
        });
        return findFollows;
    }

    async followUser(followedById: number, followingId: number){
        const findFollow = await this.findOneFollow(followedById,followingId)
        if(findFollow){
            throw new BadRequestException("You are already following")
        }
        const followUser = await this.prisma.follows.create({
            data:{
                followedById,
                followingId
            }
        })
        return followUser;
    }

    async unFollowUser(followedById: number, followingId: number){
        const findFollow = await this.findOneFollow(followedById, followingId);
        if(!findFollow){
            throw new NotFoundException("Follow not found")
        }
        const unFollowUser = await this.prisma.follows.delete({
            where:{
                id: findFollow.id
            }
        });
        return unFollowUser;
    }
}
