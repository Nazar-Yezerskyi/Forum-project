import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import * as crypto from 'crypto';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService, 
        private mailerService: MailerService,
        private jwt: JwtService
        ){}
    
    private async hashPassword(password: string){
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(password, salt);
        return `${salt}.${hash}`;
    }

    private async checkEmailExists(email: string){
        const users = await this.userService.findByEmail(email)
        if(users){
            throw new BadRequestException('email in use')
        }
    }

    private async verifyPassword(password: string, storedPassword: string){
        const [salt, storedhash] = storedPassword.split('.');
        const hash = await bcrypt.hash(password, salt);
        return storedhash === hash;
    }

    async createAccount(firstName: string,lastName: string,email: string,password: string,accountImg?: string){
        const rolesId = 1
        await this.checkEmailExists(email);
        const verificationToken = crypto.randomBytes(32).toString('hex');
       
        const hashedpassword = await this.hashPassword(password) 
        const data = {
            firstName,
            lastName,
            email,
            rolesId,
            password: hashedpassword,
            accountImg,
            verificationToken
        }
        const savedUser = await this.userService.createUser(data)
        
        const verificationUrl = `http://localhost:3000/verify-email?token=${verificationToken}`;
        await this.mailerService.sendMail({
          to: email,
          subject: 'Please confirm your email',
          text: `Hello ${firstName},\n\nPlease confirm your email by clicking on the following link: ${verificationUrl}\n\nThank you!`,

          context: {
            firstName,
            verificationUrl,
          },
        });
        return savedUser;
    }

    async signIn(body:{email: string,password: string}){
        const user = await this.userService.findByEmail(body.email);
        if(!user){
            throw new NotFoundException('user not found');
        }
        if (!user.isVerified) {
            throw new HttpException('User must be verified', HttpStatus.FORBIDDEN);
          }
        const isPasswordValid = await this.verifyPassword(body.password,user.password);
        if(!isPasswordValid){
            throw new BadRequestException('bad password');
        }
        const updatedUser = await this.userService.updateLastLogIn(user.id);

        const accessToken = await this.jwt.signAsync(
            {
                userId: user.id,
                email: user.email,
                roleId: user.rolesId
            },
            { secret: process.env.JWT_SECRET_KEY, expiresIn: process.env.JWT_EXPIRATION_TIME }
        )

        const refreshToken = await this.jwt.signAsync(
            {
                userId: user.id,
                email: user.email,
                roleId: user.rolesId
            },
            { secret: process.env.JWT_REFRESH_SECRET_KEY, expiresIn: process.env.JWT_REFRESH_EXPIRATION_TIME },
          );
          return {
            user: updatedUser,
            accessToken,
            refreshToken,
          };
    }

    async verifyAccount(verificationToken: string){
        const user = await this.userService.findByToken(verificationToken)
        if (!user) {
            throw new BadRequestException('Invalid or expired verification token.');
        }
        const updatedUser = this.userService.verifyUser(user.id)
      
          return updatedUser;
    }

}
