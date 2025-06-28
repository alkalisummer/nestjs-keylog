import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  userId: string;

  @IsString()
  @IsOptional()
  userNickname?: string;

  @IsString()
  @IsOptional()
  userBlogName?: string;

  @IsEmail()
  @IsOptional()
  userEmail?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  userPassword?: string;

  @IsString()
  @IsOptional()
  userThmbImgUrl?: string;
}
