import { Injectable } from '@nestjs/common';
import { UserRepository, UserInfo, TokenInfo, VerifyCodeInfo } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';

import { LoginUserDto } from './dto/login-user.dto';
import { CreateVerifyCodeDto } from './dto/verify-code.dto';
import { CreateUserTokenDto, DeleteUserTokenDto } from './dto/user-token.dto';
import { User } from './entities/user.entity';
import { VerifyCode } from './entities/verify-code.entity';
import { UserToken } from './entities/user-token.entity';
import { comparePassword } from '../../shared/utils';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getUserById(userId: string, userEmail?: string): Promise<UserInfo | undefined> {
    return this.userRepository.getUserById(userId, userEmail);
  }

  async loginUser(loginUserDto: LoginUserDto): Promise<UserInfo | null> {
    const user = await this.userRepository.getUserById(loginUserDto.userId || '', loginUserDto.userEmail);

    if (!user) {
      return null;
    }

    const isPasswordValid = await comparePassword(loginUserDto.userPassword, user.USER_PASSWORD);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    return this.userRepository.createUser(createUserDto);
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    await this.userRepository.updatePassword(userId, newPassword);
  }

  async uploadUserImage(userId: string, imageUrl: string): Promise<void> {
    await this.userRepository.uploadUserImage(userId, imageUrl);
  }

  async deleteUserImage(userId: string): Promise<void> {
    await this.userRepository.deleteUserImage(userId);
  }

  async updateNicknameBlogName(userId: string, userNickname: string, userBlogName: string): Promise<void> {
    await this.userRepository.updateNicknameBlogName(userId, userNickname, userBlogName);
  }

  async updateEmail(userId: string, userEmail: string): Promise<void> {
    await this.userRepository.updateEmail(userId, userEmail);
  }

  async getCurrentPassword(userId: string): Promise<string | undefined> {
    return this.userRepository.getCurrentPassword(userId);
  }

  async deleteUser(userId: string): Promise<void> {
    await this.userRepository.deleteUser(userId);
  }

  async createVerifyCode(createVerifyCodeDto: CreateVerifyCodeDto): Promise<VerifyCode> {
    return this.userRepository.createVerifyCode(createVerifyCodeDto);
  }

  async getVerifyCode(verifyCodeId: number): Promise<VerifyCodeInfo | undefined> {
    return this.userRepository.getVerifyCode(verifyCodeId);
  }

  async deleteVerifyCode(verifyCodeId: number): Promise<void> {
    await this.userRepository.deleteVerifyCode(verifyCodeId);
  }

  async createUserToken(createUserTokenDto: CreateUserTokenDto): Promise<UserToken> {
    return this.userRepository.createUserToken(createUserTokenDto);
  }

  async getUserToken(token: string): Promise<TokenInfo | undefined> {
    return this.userRepository.getUserToken(token);
  }

  async deleteUserToken(deleteUserTokenDto: DeleteUserTokenDto): Promise<void> {
    await this.userRepository.deleteUserToken(deleteUserTokenDto);
  }
}
