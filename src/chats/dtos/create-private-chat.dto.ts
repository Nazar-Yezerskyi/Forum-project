import { IsNumber } from "class-validator";

export class CreatePrivateChatDto{
    @IsNumber()
    connectedUserId: number;
}