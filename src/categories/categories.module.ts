import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { AdminGuard } from 'src/guards/admin.guard';

@Module({
  imports: [PrismaModule,JwtModule],
  providers: [CategoriesService, AdminGuard],
  controllers: [CategoriesController],
  exports: [CategoriesService]
})
export class CategoriesModule {}
