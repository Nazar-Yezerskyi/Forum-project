import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AdminGuard implements CanActivate{
    constructor(private readonly jwt: JwtService){}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const authorization = request.headers['authorization'];
        const userRole = request.user?.roleId;
        if(!authorization){
            throw new UnauthorizedException('No authorization header')
        }
        if(userRole === 2){
            return true
        }
        throw new ForbiddenException('Only an admin can do this');
    }
}