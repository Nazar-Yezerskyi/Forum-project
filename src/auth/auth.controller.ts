import { BadRequestException, Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dtos/create-user.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService){}

    @Post('/sign-up')
    async createAccount(@Body() body: CreateUserDto){
        if(body.password !== body.confirmPassword){
            throw new Error("Password and confirmPassword must mutch");
        }
        return this.authService.createAccount(body.firstName, body.lastName,body.email, body.password, body.accountImg)
    }

    @Post('/sign-in')
    async signIn(@Body() body: {email: string, password: string}){
        return this.authService.signIn(body)
    }

    @Get('/verify-email')
    async verifyAccount(@Query('token') verificationToken: string) {
        try {
            const updatedUser = await this.authService.verifyAccount(verificationToken);
            return { message: 'Email successfully verified', user: updatedUser };
        } catch (error) {
            throw new BadRequestException('Invalid or expired verification token');
        }
    }
}
