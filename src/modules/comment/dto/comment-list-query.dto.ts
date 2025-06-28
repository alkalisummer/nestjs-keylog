import { IsOptional, IsString, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

export class CommentListQueryDto {
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  @IsInt()
  postId: number;

  @IsOptional()
  @IsString()
  rgsrId?: string;
}
