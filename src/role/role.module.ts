import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AdminGuard } from 'src/guards/admin.guard';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [RoleController],
  providers: [RoleService, AdminGuard],
  imports: [PrismaModule,JwtModule]
})
export class RoleModule {}
