import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class SignInDto{
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

}