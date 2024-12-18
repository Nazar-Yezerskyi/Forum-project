import { IsOptional, IsString } from "class-validator";

export class UpdateCategoryDto{
    @IsString()
    @IsOptional()
    title: string;

    @IsString()
    @IsOptional()
    description: string;
}