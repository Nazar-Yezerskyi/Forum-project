import { IsEmail, IsInt, IsOptional, IsString } from "class-validator"

export class CreateUserDto{
    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsEmail()
    email: string;

    @IsString()
    password: string;

    @IsInt()
    roleId: number;

    @IsOptional()
    @IsString()
    accountImg?: string;

    @IsString()
    verificationToken: string
}
