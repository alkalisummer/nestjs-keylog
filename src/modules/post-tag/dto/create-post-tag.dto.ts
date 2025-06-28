import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePostTagDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  postId: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  hashtagId: number;
}
