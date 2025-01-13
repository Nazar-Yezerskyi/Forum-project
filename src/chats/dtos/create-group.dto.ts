import { IsNotEmpty, IsArray, IsNumber, IsOptional, IsString, ArrayNotEmpty } from 'class-validator';

export class CreateGroupChatDto {
    @IsArray()
    @ArrayNotEmpty()
    @IsNumber()
    usersId: number[];

    @IsString()
    @IsOptional()
    chatName?: string;
}
