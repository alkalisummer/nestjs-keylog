import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class HashtagQueryDto {
  @IsOptional()
  @IsString()
  postId?: string;

  @IsOptional()
  @IsString()
  id?: string; // userId

  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: string }) => value?.trim())
  hashtagName?: string;
}
