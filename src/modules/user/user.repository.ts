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
  userId: string;
  userEmail: string;
  userNickname: string;
  userPassword: string;
  userThmbImgUrl: string;
  userBlogName: string;
}

export interface TokenInfo {
  token: string;
  userId: string;
  expireTime: string;
}

export interface VerifyCodeInfo {
  verifyCodeId: number;
  verifyCode: string;
  expirationTime: string;
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
        'user.user_id AS userId',
        'user.user_email AS userEmail',
        'user.user_nickname AS userNickname',
        'user.user_password AS userPassword',
        'user.user_thmb_img_url AS userThmbImgUrl',
        'user.user_blog_name AS userBlogName',
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
    const result: { userPassword?: string } | undefined = await this.userRepository
      .createQueryBuilder('user')
      .select('user.user_password AS userPassword')
      .where('user.user_id = :userId', { userId })
      .getRawOne();

    return result?.userPassword;
  }

  async deleteUser(userId: string): Promise<void> {
    await this.userRepository.delete(userId);
  }

  async createVerifyCode(createVerifyCodeDto: CreateVerifyCodeDto): Promise<VerifyCode> {
    const currentTime = timeToString(new Date());

    const verifyCode = this.verifyCodeRepository.create({
      verifyCode: createVerifyCodeDto.verifyCode,
      expirationTime: createVerifyCodeDto.expireTime,
      rgsnDttm: currentTime,
    });

    return this.verifyCodeRepository.save(verifyCode);
  }

  async getVerifyCode(code: string): Promise<VerifyCodeInfo | undefined> {
    const result: VerifyCodeInfo | undefined = await this.verifyCodeRepository
      .createQueryBuilder('verifyCode')
      .select([
        'verifyCode.verify_code_id AS verifyCodeId',
        'verifyCode.verify_code AS verifyCode',
        'verifyCode.expiration_time AS expirationTime',
      ])
      .where('verifyCode.verify_code = :code', { code })
      .getRawOne();

    return result;
  }

  async deleteVerifyCode(code: string): Promise<void> {
    await this.verifyCodeRepository.delete({ verifyCode: code });
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
      .select(['userToken.token AS token', 'userToken.user_id AS userId', 'userToken.expire_time AS expireTime'])
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
