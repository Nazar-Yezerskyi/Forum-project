import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from 'src/interfaces/jwt-payload.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate{
    constructor(private readonly jwt: JwtService){}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const authorization = request.headers['authorization'];

        if(!authorization){
            throw new UnauthorizedException('No authorization header')
        }

        const token = authorization.replace('Bearer ', '');
        try{
            const payload: JwtPayload = this.jwt.verify(token, {
                secret: process.env.JWT_SECRET_KEY
            });
            request.user = payload; 
            console.log('Decoded payload:', payload);
            return true;
        } catch(error){
            throw new UnauthorizedException('Invalid or expired token')
        }
    }
}