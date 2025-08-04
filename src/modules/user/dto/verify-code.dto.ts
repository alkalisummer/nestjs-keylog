import { IsString } from 'class-validator';

export class CreateVerifyCodeDto {
  @IsString()
  verifyCode: string;

  @IsString()
  expireTime: string;
}

export class GetVerifyCodeDto {
  @IsString()
  verifyCodeId: string;
}
