import {IsArray, IsNumber,ArrayNotEmpty } from 'class-validator';

export class AddUserToGroupDto {
    @IsArray()
    @ArrayNotEmpty()
    @IsNumber()
    usersId: number[];
}
