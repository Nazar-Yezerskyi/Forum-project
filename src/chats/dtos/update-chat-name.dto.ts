import { IsNumber, IsString } from "class-validator";

export class UpdateChatNameDto{
    @IsString()
    chatName:string;
}