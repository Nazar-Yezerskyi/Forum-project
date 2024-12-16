import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { UserService } from 'src/user/user.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor( private readonly usersService: UserService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,  
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, 
      callbackURL: 'http://localhost:3000/auth/google/redirect', 
      scope: ['email', 'profile'], 
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback){
    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      accountImg: photos[0].value,
      accessToken,
    };
    const savedUser = await this.usersService.findOrCreateUser(user);

    done(null, savedUser);
  }
}
