import { IsString, IsOptional, IsIn } from 'class-validator';

export class CreatePostDto {
  @IsString()
  postTitle: string;

  @IsString()
  postCntn: string;

  @IsString()
  postHtmlCntn: string;

  @IsString()
  @IsOptional()
  postThmbImgUrl?: string;

  @IsString()
  authorId: string;

  @IsString()
  @IsIn(['Y', 'N'])
  tempYn: string;

  @IsOptional()
  postOriginId?: number;
}
