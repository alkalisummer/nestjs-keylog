import { IsString, IsInt } from 'class-validator';

export class CreateCommentDto {
  @IsInt()
  postId: number;

  @IsString()
  commentCntn: string;

  @IsString()
  rgsrId: string;
}
