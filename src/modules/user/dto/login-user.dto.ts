import { IsString, IsEmail, IsOptional } from 'class-validator';

export class LoginUserDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsEmail()
  @IsOptional()
  userEmail?: string;

  @IsString()
  userPassword: string;
}
