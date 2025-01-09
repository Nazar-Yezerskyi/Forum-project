import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let mailerService: MailerService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
            createUser: jest.fn(),
            updatedLastLogIn: jest.fn()
          },
        },
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {},
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    mailerService = module.get<MailerService>(MailerService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('should create an account successfully', async () => {
    const mockCreateUser = { 
      firstName: 'John', 
      lastName: 'Doe', 
      email: 'john.doe@example.com', 
      password: 'hashedpassword', 
      roleId: 1, 
      verificationToken: 'someToken'
    };
    
    userService.findByEmail = jest.fn().mockResolvedValue(null); 
    userService.createUser = jest.fn().mockResolvedValue(mockCreateUser);
    mailerService.sendMail = jest.fn().mockResolvedValue(true); 

    const result = await authService.createAccount(
      'John', 
      'Doe', 
      'john.doe@example.com', 
      'password123', 
      'profile.jpg', 
      'password123'
    );

    expect(result).toEqual(mockCreateUser);
    expect(userService.findByEmail).toHaveBeenCalledWith('john.doe@example.com');
    expect(userService.createUser).toHaveBeenCalled();
    expect(mailerService.sendMail).toHaveBeenCalled();
  });

  it('should throw BadRequestException if email is already in use', async () => {
    const existingUser = { email: 'existing.email@example.com' };
    userService.findByEmail = jest.fn().mockResolvedValue(existingUser);

    await expect(
      authService.createAccount('John', 'Doe', 'existing.email@example.com', 'password123', 'profile.jpg', 'password123'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw Error if passwords do not match', async () => {
    await expect(
      authService.createAccount('John', 'Doe', 'john.doe@example.com', 'password123', 'profile.jpg', 'password124'),
    ).rejects.toThrow(Error);
  });

  it('should sign in user', async () =>{
     const mockUser = {id: 1, email: 'test@gmail.com', password:'hashedPassword', isVerified: true, roleId: 1}
     const mockUpdatedUser = {...mockUser, lastLogin: new Date()}
     const mockAccessToken = 'accessToken'
     const mockRefreshToken = 'refreshToken'

     userService.findByEmail = jest.fn().mockResolvedValue(mockUser)
     userService.updateLastLogIn = jest.fn().mockResolvedValue(mockUpdatedUser)

     jest.spyOn<any, any>(authService, 'verifyPassword').mockResolvedValue(true)
     jest.spyOn<any, any>(authService, 'generateAccessToken').mockResolvedValue(mockAccessToken)
     jest.spyOn<any, any>(authService,'generateRefreshToken').mockResolvedValue(mockRefreshToken)

     const result = await authService.signIn({email: 'test@gmail.com', password: "hashedPassword"})
     expect(result).toEqual({
      user:  mockUpdatedUser,
      accessToken: mockAccessToken,
      refreshToken: mockRefreshToken
     })

     expect(userService.findByEmail).toHaveBeenCalledWith("test@gmail.com")
     expect(userService.updateLastLogIn).toHaveBeenCalledWith(mockUser.id)
     expect(authService['generateAccessToken']).toHaveBeenCalledWith(mockUser.id, mockUser.email, mockUser.roleId )
     expect(authService['generateRefreshToken']).toHaveBeenCalledWith(mockUser.id, mockUser.email, mockUser.roleId )
  })
  it('should throw NotFoundException if user not found', async () => {
    userService.findByEmail = jest.fn().mockResolvedValue(null);
    await expect(
      authService.signIn({email: "test@gmail.com", password:"hashedPassword"}),
    ).rejects.toThrow(NotFoundException);
  });
  it('should throw HttpException if user not verified', async () => {
    const mockUser = {id: 1, email: "test@gmail.com", password: 'hashedPassword', isVerified: false}
    userService.findByEmail = jest.fn().mockResolvedValue(mockUser);

    await expect(
      authService.signIn({email: "test@gmail.com", password:"hashedPassword"}),
    ).rejects.toThrow(new HttpException("User must be verified",HttpStatus.FORBIDDEN));
  });
});
