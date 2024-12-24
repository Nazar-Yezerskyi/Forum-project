import { Controller, Get, Query, Request, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ActionsService } from './actions.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { GetStatisticsDto } from './dtos/get-statistics.dto';

@Controller('actions')
export class ActionsController {
    constructor(private actionsService: ActionsService){}

    @Get()
    @UseGuards(JwtAuthGuard)
    async getStatistics(
        @Request() req,
        @Query() data: GetStatisticsDto
    ) {
        const isAdmin = req.user.roleId === 2; 

        if (!isAdmin && data.userId) {
            throw new UnauthorizedException('Only admins can specify userId');
        }

        const finalUserId = isAdmin && data.userId ? data.userId : req.user.id; 

        return await this.actionsService.getStatistics({
            ...data, 
            userId: finalUserId,
        });
    
    }
    
}
