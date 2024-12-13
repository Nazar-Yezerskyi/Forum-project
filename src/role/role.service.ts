import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoleService {
    constructor(private prisma: PrismaService){}

    async findAllRoles(){
        const roles = await this.prisma.roles.findMany();
        return roles
    }

    async getInfoRole(id: number){
        const role = await this.prisma.roles.findUnique({where:{
            id
        }});
    }
    async createRole(name: string){
        const role = await this.prisma.roles.create({
            data:{
                name
            }});
        return role;
    }

    async updateRole(id:number, name: string){
        const role = await this.prisma.roles.update({
            where: {id},
            data:name
        })
        return role;
 
    }
    async deleteRole(id: number){
        const role = await this.prisma.roles.delete({where:{id}})
        return role;
    }
}
