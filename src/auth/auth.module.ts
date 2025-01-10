import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config'; //
import { GoogleStrategy } from './utils/google-strategy';
import { ActionsModule } from 'src/actions/actions.module';
@Module({
  providers: [AuthService,GoogleStrategy],
  controllers: [AuthController],
  imports:[UserModule,
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET_KEY'), 
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRATION_TIME') }, 
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      imports: [],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_REFRESH_SECRET_KEY'),
        signOptions: { expiresIn: configService.get<string>('JWT_REFRESH_EXPIRATION_TIME') },
      }),
      inject: [ConfigService],
    }),
  ]
})
export class AuthModule {}
