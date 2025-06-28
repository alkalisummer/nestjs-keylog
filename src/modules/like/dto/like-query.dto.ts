import { IsNumber } from 'class-validator';

export class LikeQueryDto {
  @IsNumber()
  postId: number;
}
