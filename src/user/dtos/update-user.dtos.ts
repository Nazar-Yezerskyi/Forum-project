import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()  
    @IsString() 
    firstName?: string;

    @IsOptional()  
    @IsString() 
    lastName?: string;

    @IsOptional()  
    @IsString() 
    accountImg?: string;

    @IsOptional()
    @IsEmail() 
    email?: string;

    @IsOptional()
    @IsString()
    @MinLength(6, { message: 'Password is too short. It should be at least 6 characters.' })  
    password?: string;
}
