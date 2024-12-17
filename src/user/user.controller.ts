import { Body, Controller, Get, Param, Post, Put, Query, UseGuards,Request, BadRequestException, Delete, NotFoundException} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { UpdateUserDto } from './dtos/update-user.dtos';
import { RolesGuard } from 'src/guards/roles.guard';
import { CreateUserDto } from './dtos/create-user.dro';

@Controller('users')
export class UserController {
    constructor(private userService: UserService){}

    @Get('')
    async findAll(@Query('name') name?: string, @Query('email') email?: string){
        return await this.userService.findAll(name, email)
    }

    @Get(':id')
    async findOne(@Param('id') id: string){
        return await this.userService.findOne(+id)
    }

    @Post()
    async createUser(@Body()  body: CreateUserDto){
        return await this.userService.createUser(body)
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)  
    async updateUser(@Param('id') id: string,@Body() updateUserDto: UpdateUserDto,@Request() req){
        if (req.user.userId !== +id) {
            throw new BadRequestException('You can only update your own profile');
        }
        const updatedUser = await this.userService.updateUser(id, updateUserDto);
        return updatedUser;
    }

    @Delete(':id')
    @UseGuards(RolesGuard) 
    async deleteUser(@Param('id') id: string, @Request() req) {
        console.log(req.user.userId)
        if (req.user.userId !== +id) {
            
            throw new BadRequestException('You can only update your own profile');
        }

        const userToDelete = await this.userService.findOne(+id);
        if (!userToDelete) {
          throw new NotFoundException('User not found');
        }
        await this.userService.deleteUser(+id);
        return { message: 'User successfully deleted' };
    }

}
