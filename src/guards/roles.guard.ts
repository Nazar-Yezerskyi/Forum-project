import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtAuthGuard } from "./jwt-auth.guard";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private  jwtAuthGuard: JwtAuthGuard,
    ) {}

    canActivate(context: ExecutionContext): boolean {
        const parentCanActivate = this.jwtAuthGuard.canActivate(context);
        if (!parentCanActivate) {
            return false;
        }

        const request = context.switchToHttp().getRequest();
        const userRole = request.user?.roleId;
        const userIdFromToken = request.user?.userId;
        const userIdFromParams = Number(request.params.id);


        if (userRole === 2) {
            return true;
        }

        if (userIdFromToken === userIdFromParams) {
            return true;
        }

        throw new ForbiddenException('You can only delete your own account');
    }
}