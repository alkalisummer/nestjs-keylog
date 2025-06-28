import { IsString } from 'class-validator';

export class CreateVerifyCodeDto {
  @IsString()
  verifyCode: string;

  @IsString()
  expirationTime: string;
}

export class GetVerifyCodeDto {
  @IsString()
  verifyCodeId: string;
}
