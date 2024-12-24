import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { EntityType } from '@prisma/client';

export class GetStatisticsDto {
  @IsOptional()
  @IsNumber()
  userId?: number;

  @IsOptional()
  @IsString()
  startDate: string;

  @IsOptional()
  @IsString()
  endDate: string;

  @IsOptional()
  @IsString()
  entityTypes: string;
  
  @IsOptional()
  @IsEnum(['hour', 'day', 'week', 'month', 'total'])
  interval: string;
}