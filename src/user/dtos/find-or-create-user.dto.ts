import { IsEmail, IsOptional, IsString } from "class-validator";

export class FindOrCreateUserDto{
    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    accountImg?: string;
}