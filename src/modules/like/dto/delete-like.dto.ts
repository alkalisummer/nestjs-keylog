import { IsString, IsNumber } from 'class-validator';

export class DeleteLikeDto {
  @IsString()
  userId: string;

  @IsNumber()
  postId: number;
}
