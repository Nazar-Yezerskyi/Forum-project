import { IsString, IsEmail, IsOptional, IsInt, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  password: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword: string

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  accountImg?: string;

}