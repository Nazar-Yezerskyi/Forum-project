import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dtos/update-user.dtos';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService){}

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
        const user = await this.prisma.users.findUnique({where:{id}});
        console.log(user)
        if(!user){
            throw new NotFoundException(`User with id ${id} not found`)
        }
        return user;
    }

    async createUser(data: {
        firstName: string,
        lastName: string,
        email: string,
        password: string,
        rolesId: number,
        accountImg?: string,
        verificationToken: string, 
    }) {
        return await this.prisma.users.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                password: data.password,
                rolesId: data.rolesId,
                accountImg: data.accountImg || null,
                verificationToken: data.verificationToken
            },
        });
    }

    async updateUser(id: string, updateUserDto: UpdateUserDto) {
        const user = await this.findOne(Number(id));  
        const updatedData = {... updateUserDto}

        const updatedUser = await this.prisma.users.update({
            where:{id: user.id},
            data:updatedData
        })
        return updatedUser
    }

    async deleteUser(id: number) {
        await this.prisma.users.delete({
          where: { id },
        });
    }

    async findByEmail(email: string) {
        const user = await this.prisma.users.findUnique({ where: { email } });
        return user;
    }

    async findByToken(verificationToken: string){
        const user = await this.prisma.users.findFirst({where:{verificationToken}})
        if(!user){
            throw new NotFoundException(`User not found`)
        }
        return user
    }
    
    async verifyUser(id: number){
        const updatedUser = await this.prisma.users.update({
            where: { id },
            data: {
                isVerified: true,  
              verificationToken: null,  
            },
          });
      
    }
    async updateLastLogIn(id: number){
        const updatedUser = await this.prisma.users.update({
            where: { id },
            data: {
              lastLogIn: new Date(), 
            },
          });
      
          return updatedUser;
    }

    async findOrCreateUser(userData: {
        firstName: string;
        lastName: string;
        email: string;
        accountImg?: string;
      }) {
        const { email, firstName, lastName, accountImg } = userData;
    
        let user = await this.prisma.users.findUnique({
          where: { email },
        });
    
        if (!user) {
          user = await this.prisma.users.create({
            data: {
              firstName,
              lastName,
              email,
              accountImg,
              password: '',
              role: { connect: { id: 1 } }, 
              isVerified: true
            },
          });
        }
    
        return user;
    }
    
}
