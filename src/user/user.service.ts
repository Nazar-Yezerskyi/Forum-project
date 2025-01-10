import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dtos/update-user.dtos';
import { CreateUserDto } from './dtos/create-user.dro';
import { FindOrCreateUserDto } from './dtos/find-or-create-user.dto';
import { ActionsService } from 'src/actions/actions.service';
import { UserActions } from 'src/enums/user-actions.enum';
import { EntityTypes } from 'src/enums/entity-types.enum';

@Injectable()
export class UserService {
    constructor(
      private prisma: PrismaService,
      private actionsService: ActionsService
      ){}

    async findAll(username?: string, email?: string) {
        return await this.prisma.users.findMany({
          where: {
            AND: [
              username
                ? {
                    firstName: {
                      contains: username, 
                      mode: 'insensitive', 
                    },
                  }
                : {},
              email
                ? {
                    email: {
                      contains: email,
                      mode: 'insensitive',
                    },
                  }
                : {},
            ],
          },
        });
    }

    async findOne(id: number){
        const user = await this.prisma.users.findUnique({
          where:{
            id
          }
        });
        console.log(user)
        if(!user){
            throw new NotFoundException(`User with id ${id} not found`)
        }
        return user;
    }

    async createUser(data: CreateUserDto) {
        return await this.prisma.users.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                password: data.password,
                roleId: data.roleId,
                accountImg: data.accountImg || null,
                verificationToken: data.verificationToken
            },
        });
    }

    async updateUser(id: string, updateUserDto: UpdateUserDto) {
        const user = await this.findOne(+id);  
        const updatedData = {...updateUserDto}

        const updatedUser = await this.prisma.users.update({
            where:{
              id: user.id
            },
            data:updatedData
        })
        const action = this.actionsService.addAction(UserActions.CREATE,user.id,EntityTypes.USER,updatedUser.id,updatedUser)
        return {updatedUser, action}
    }

    async deleteUser(id: number) {
        const deletedUser = await this.prisma.users.delete({
          where: { 
            id 
          },
        });
        const action = this.actionsService.addAction(UserActions.DELETE,id,EntityTypes.USER,deletedUser.id,deletedUser)
        return {deletedUser, action}
    }

    async findByEmail(email: string) {
        const user = await this.prisma.users.findUnique({ 
          where: {
            email 
          } 
        });
        return user;
    }

    async findByToken(verificationToken: string){
        const user = await this.prisma.users.findFirst({
          where: {
            verificationToken
          }
        })
        if(!user){
            throw new NotFoundException(`User not found`)
        }
        return user
    }
    
    async verifyUser(id: number){
        const updatedUser = await this.prisma.users.update({
            where: { 
              id 
            },
            data: {
              isVerified: true,  
              verificationToken: null,  
            },
          });
          return updatedUser;
    }
    async updateLastLogIn(id: number){
        const updatedUser = await this.prisma.users.update({
            where: { 
              id 
            },
            data: {
              lastLogIn: new Date(), 
            },
          });
      
          return updatedUser;
    }

    async findOrCreateUser(userData: FindOrCreateUserDto) {
        const { email, firstName, lastName, accountImg } = userData;
    
        let user = await this.prisma.users.findUnique({
          where: { 
            email 
          },
        });
    
        if (!user) {
          user = await this.prisma.users.create({
            data: {
              firstName,
              lastName,
              email,
              accountImg,
              password: '',
              Roles: { connect: { id: 1 } }, 
              isVerified: true
            },
          });
        }
        return user;
    }
    
}
