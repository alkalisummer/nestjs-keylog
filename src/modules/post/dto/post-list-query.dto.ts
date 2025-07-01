import { IsOptional, IsString, IsNumber, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class PostListQueryDto {
  @IsOptional()
  @IsString()
  authorId?: string; // rgsrId

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  perPage?: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  currPageNum?: number = 1;

  @IsOptional()
  @IsString()
  searchWord?: string;

  @IsOptional()
  @IsString()
  @IsIn(['Y', 'N'])
  tempYn?: string;

  @IsOptional()
  @IsString()
  tagId?: string;
}
