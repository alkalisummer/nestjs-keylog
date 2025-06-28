import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { VerifyCode } from './entities/verify-code.entity';
import { UserToken } from './entities/user-token.entity';
import { CreateUserDto } from './dto/create-user.dto';

import { CreateVerifyCodeDto } from './dto/verify-code.dto';
import { CreateUserTokenDto, DeleteUserTokenDto } from './dto/user-token.dto';
import { hashPassword, timeToString } from '../../shared/utils';

export interface UserInfo {
  USER_ID: string;
  USER_EMAIL: string;
  USER_NICKNAME: string;
  USER_PASSWORD: string;
  USER_THMB_IMG_URL: string;
  USER_BLOG_NAME: string;
}

export interface TokenInfo {
  TOKEN: string;
  USER_ID: string;
  EXPIRE_TIME: string;
}

export interface VerifyCodeInfo {
  VERIFY_CODE_ID: number;
  VERIFY_CODE: string;
  EXPIRATION_TIME: string;
}

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(VerifyCode)
    private readonly verifyCodeRepository: Repository<VerifyCode>,
    @InjectRepository(UserToken)
    private readonly userTokenRepository: Repository<UserToken>,
  ) {}

  async getUserById(userId: string, userEmail?: string): Promise<UserInfo | undefined> {
    let query = this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.user_id AS USER_ID',
        'user.user_email AS USER_EMAIL',
        'user.user_nickname AS USER_NICKNAME',
        'user.user_password AS USER_PASSWORD',
        'user.user_thmb_img_url AS USER_THMB_IMG_URL',
        'user.user_blog_name AS USER_BLOG_NAME',
      ])
      .where('user.user_id = :userId', { userId });

    if (userEmail) {
      query = query.andWhere('user.user_email = :userEmail', { userEmail });
    }

    const result: UserInfo | undefined = await query.getRawOne();
    return result;
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await hashPassword(createUserDto.userPassword);
    const currentTime = timeToString(new Date());

    const user = this.userRepository.create({
      userId: createUserDto.userId,
      userEmail: createUserDto.userEmail,
      userNickname: createUserDto.userNickname,
      userPassword: hashedPassword,
      userBlogName: createUserDto.userBlogName,
      rgsnDttm: currentTime,
      amntDttm: currentTime,
    });

    return this.userRepository.save(user);
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const hashedPassword = await hashPassword(newPassword);
    const currentTime = timeToString(new Date());

    await this.userRepository.update(userId, {
      userPassword: hashedPassword,
      amntDttm: currentTime,
    });
  }

  async uploadUserImage(userId: string, imageUrl: string): Promise<void> {
    await this.userRepository.update(userId, {
      userThmbImgUrl: imageUrl,
    });
  }

  async deleteUserImage(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      userThmbImgUrl: '',
    });
  }

  async updateNicknameBlogName(userId: string, userNickname: string, userBlogName: string): Promise<void> {
    await this.userRepository.update(userId, {
      userNickname,
      userBlogName,
    });
  }

  async updateEmail(userId: string, userEmail: string): Promise<void> {
    await this.userRepository.update(userId, {
      userEmail,
    });
  }

  async getCurrentPassword(userId: string): Promise<string | undefined> {
    const result: { USER_PASSWORD?: string } | undefined = await this.userRepository
      .createQueryBuilder('user')
      .select('user.user_password AS USER_PASSWORD')
      .where('user.user_id = :userId', { userId })
      .getRawOne();

    return result?.USER_PASSWORD;
  }

  async deleteUser(userId: string): Promise<void> {
    await this.userRepository.delete(userId);
  }

  async createVerifyCode(createVerifyCodeDto: CreateVerifyCodeDto): Promise<VerifyCode> {
    const currentTime = timeToString(new Date());

    const verifyCode = this.verifyCodeRepository.create({
      verifyCode: createVerifyCodeDto.verifyCode,
      expirationTime: createVerifyCodeDto.expirationTime,
      rgsnDttm: currentTime,
    });

    return this.verifyCodeRepository.save(verifyCode);
  }

  async getVerifyCode(verifyCodeId: number): Promise<VerifyCodeInfo | undefined> {
    const result: VerifyCodeInfo | undefined = await this.verifyCodeRepository
      .createQueryBuilder('verifyCode')
      .select([
        'verifyCode.verify_code_id AS VERIFY_CODE_ID',
        'verifyCode.verify_code AS VERIFY_CODE',
        'verifyCode.expiration_time AS EXPIRATION_TIME',
      ])
      .where('verifyCode.verify_code_id = :verifyCodeId', { verifyCodeId })
      .getRawOne();

    return result;
  }

  async deleteVerifyCode(verifyCodeId: number): Promise<void> {
    await this.verifyCodeRepository.delete(verifyCodeId);
  }

  async createUserToken(createUserTokenDto: CreateUserTokenDto): Promise<UserToken> {
    const currentTime = timeToString(new Date());

    const userToken = this.userTokenRepository.create({
      token: createUserTokenDto.token,
      userId: createUserTokenDto.userId,
      expireTime: createUserTokenDto.expireTime,
      rgsnDttm: currentTime,
    });

    return this.userTokenRepository.save(userToken);
  }

  async getUserToken(token: string): Promise<TokenInfo | undefined> {
    const result: TokenInfo | undefined = await this.userTokenRepository
      .createQueryBuilder('userToken')
      .select(['userToken.token AS TOKEN', 'userToken.user_id AS USER_ID', 'userToken.expire_time AS EXPIRE_TIME'])
      .where('userToken.token = :token', { token })
      .getRawOne();

    return result;
  }

  async deleteUserToken(deleteUserTokenDto: DeleteUserTokenDto): Promise<void> {
    await this.userTokenRepository.delete({
      token: deleteUserTokenDto.token,
      userId: deleteUserTokenDto.userId,
    });
  }
}
