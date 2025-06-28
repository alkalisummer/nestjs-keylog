import { IsString } from 'class-validator';

export class CreateUserTokenDto {
  @IsString()
  token: string;

  @IsString()
  userId: string;

  @IsString()
  expireTime: string;
}

export class GetUserTokenDto {
  @IsString()
  token: string;
}

export class DeleteUserTokenDto {
  @IsString()
  token: string;

  @IsString()
  userId: string;
}
