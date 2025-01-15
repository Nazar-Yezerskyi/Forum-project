import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { LikesModule } from './likes/likes.module';
import { CategoriesModule } from './categories/categories.module';
import { FollowersModule } from './followers/followers.module';
import { ActionsModule } from './actions/actions.module';
import { ChatsModule } from './chats/chats.module';
import { ChatGatewayModule } from './chat-gateway/chat-gateway.module';
import { MessagesModule } from './messages/messages.module';



@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
      MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST'),
          port: configService.get<number>('MAIL_PORT'),
          secure: false,
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASS'),
          },
        },
        defaults: {
          from: configService.get<string>('MAIL_FROM'),
        },
      }),
    }),
    
    UserModule, 
    RoleModule, 
    PrismaModule, 
    AuthModule, PostsModule, CommentsModule, LikesModule, CategoriesModule, FollowersModule, ActionsModule, ChatsModule, ChatGatewayModule, MessagesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
