import { IsString, IsInt } from 'class-validator';

export class UpdateCommentDto {
  @IsInt()
  commentId: number;

  @IsString()
  commentCntn: string;
}
