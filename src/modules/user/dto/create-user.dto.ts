import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  userId: string;

  @IsEmail()
  userEmail: string;

  @IsString()
  userNickname: string;

  @IsString()
  @MinLength(6)
  userPassword: string;

  @IsString()
  @IsOptional()
  userBlogName?: string;
}
