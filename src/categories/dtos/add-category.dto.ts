import { IsOptional, IsString } from "class-validator";

export class AddCategoryDto{
    @IsString()
    title: string;

    @IsString()
    @IsOptional()
    description: string;
}