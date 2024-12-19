import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { CategoriesModule } from 'src/categories/categories.module';

@Module({
  controllers: [PostsController],
  providers: [PostsService, JwtAuthGuard],
  imports: [PrismaModule,JwtModule,CategoriesModule]
})
export class PostsModule {}