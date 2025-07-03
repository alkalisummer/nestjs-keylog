import { IsString, IsInt } from 'class-validator';

export class CreateReplyDto {
  @IsInt()
  postId: number;

  @IsInt()
  commentOriginId: number;

  @IsString()
  commentCntn: string;

  @IsString()
  authorId: string;
}
