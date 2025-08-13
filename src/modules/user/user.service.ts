import { Injectable } from '@nestjs/common';
import { UserRepository, UserInfo, TokenInfo, VerifyCodeInfo } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';

import { LoginUserDto } from './dto/login-user.dto';
import { CreateVerifyCodeDto } from './dto/verify-code.dto';
import { CreateUserTokenDto, DeleteUserTokenDto } from './dto/user-token.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { User } from './entities/user.entity';
import { VerifyCode } from './entities/verify-code.entity';
import { UserToken } from './entities/user-token.entity';
import { comparePassword } from '../../shared/utils';
import { timeToString } from '../../shared/utils';
import { JwtService } from '@nestjs/jwt';
import { LoginResponse } from './models/login-response.model';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async getUserById(userId: string, userEmail?: string): Promise<UserInfo | undefined> {
    return this.userRepository.getUserById(userId, userEmail);
  }

  async loginUser(loginUserDto: LoginUserDto): Promise<LoginResponse | null> {
    if (!loginUserDto.userId) {
      return null;
    }

    const userPassword: string | undefined = await this.userRepository.getUserPassword(
      loginUserDto.userId,
      loginUserDto.userEmail,
    );

    if (!userPassword) {
      return null;
    }

    const isPasswordValid = await comparePassword(loginUserDto.userPassword, userPassword);
    if (!isPasswordValid) {
      return null;
    }

    const userInfo: UserInfo | undefined = await this.userRepository.getUserById(loginUserDto.userId);
    if (!userInfo) {
      return null;
    }

    const payload = { sub: userInfo.userId, email: userInfo.userEmail };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.generateRefreshToken(userInfo.userId);
    return { accessToken, refreshToken, user: userInfo };
  }

  async refreshTokens(dto: RefreshTokenDto): Promise<LoginResponse | null> {
    const tokenInfo = await this.userRepository.getUserToken(dto.refreshToken);
    if (!tokenInfo) {
      return null;
    }
    const nowStr = timeToString(new Date());
    if (tokenInfo.expireTime <= nowStr) {
      await this.userRepository.deleteUserToken({ token: tokenInfo.token, userId: tokenInfo.userId });
      return null;
    }
    const userInfo = await this.userRepository.getUserById(tokenInfo.userId);
    if (!userInfo) {
      await this.userRepository.deleteUserToken({ token: tokenInfo.token, userId: tokenInfo.userId });
      return null;
    }
    await this.userRepository.deleteUserToken({ token: tokenInfo.token, userId: tokenInfo.userId });
    const newRefreshToken = await this.generateRefreshToken(tokenInfo.userId);
    const accessToken = await this.jwtService.signAsync({ sub: userInfo.userId, email: userInfo.userEmail });
    return { accessToken, refreshToken: newRefreshToken, user: userInfo };
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const { randomBytes } = await import('crypto');
    const token = randomBytes(48).toString('hex');
    const expiresInDays = parseInt(process.env.REFRESH_EXPIRES_DAYS || '14', 10);
    const expireDate = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
    const expireTime = timeToString(expireDate);
    const createUserTokenDto: CreateUserTokenDto = { token, userId, expireTime };
    await this.userRepository.createUserToken(createUserTokenDto);
    return token;
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

  async getVerifyCode(code: string): Promise<VerifyCodeInfo | undefined> {
    return this.userRepository.getVerifyCode(code);
  }

  async deleteVerifyCode(code: string): Promise<void> {
    await this.userRepository.deleteVerifyCode(code);
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
