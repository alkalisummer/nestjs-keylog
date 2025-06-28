import { IsString, IsNumber } from 'class-validator';

export class CreateLikeDto {
  @IsString()
  userId: string;

  @IsNumber()
  postId: number;
}
