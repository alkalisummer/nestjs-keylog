import { IsString, IsOptional, IsIn, IsNumber } from 'class-validator';

export class UpdatePostDto {
  @IsNumber()
  postId: number;

  @IsString()
  @IsOptional()
  postTitle?: string;

  @IsString()
  @IsOptional()
  postCntn?: string;

  @IsString()
  @IsOptional()
  postHtmlCntn?: string;

  @IsString()
  @IsOptional()
  postThmbImgUrl?: string;

  @IsString()
  @IsIn(['Y', 'N'])
  @IsOptional()
  tempYn?: string;
}
