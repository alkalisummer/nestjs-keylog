import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ValidationPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateVerifyCodeDto } from './dto/verify-code.dto';
import { CreateUserTokenDto, DeleteUserTokenDto } from './dto/user-token.dto';
import { Req, Res } from '@nestjs/common';
import { Public } from '../../core/auth/public.decorator';
import { buildRefreshCookieOptions, clearCookie, getCookie, setCookie } from '../../shared/utils';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Get(':userId')
  async getUserById(@Param('userId') userId: string, @Query('email') userEmail?: string) {
    const user = await this.userService.getUserById(userId, userEmail);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  @Public()
  @Post('login')
  async loginUser(@Body(ValidationPipe) loginUserDto: LoginUserDto, @Res({ passthrough: true }) res: unknown) {
    const userRes = await this.userService.loginUser(loginUserDto);
    if (!userRes) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    const { accessToken, refreshToken, user } = userRes;
    setCookie(res, 'refreshToken', refreshToken, buildRefreshCookieOptions());
    return { accessToken, user };
  }

  @Public()
  @Post('refresh')
  async refreshTokens(@Req() req: unknown, @Res({ passthrough: true }) res: unknown) {
    const cookieToken = getCookie(req, 'refreshToken');
    const result = await this.userService.refreshTokens({ refreshToken: cookieToken ?? '' });
    if (!result) {
      throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
    }
    setCookie(res, 'refreshToken', result.refreshToken, buildRefreshCookieOptions());
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('logout')
  async logout(@Req() req: unknown, @Res({ passthrough: true }) res: unknown) {
    const token = getCookie(req, 'refreshToken');
    if (token) {
      const info = await this.userService.getUserToken(token);
      if (info) {
        await this.userService.deleteUserToken({ token: info.token, userId: info.userId });
      }
    }
    clearCookie(res, 'refreshToken', { path: '/' });
    return { message: 'Logged out' };
  }

  @Public()
  @Post('signup')
  async createUser(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Put(':userId/password')
  async updatePassword(@Param('userId') userId: string, @Body('password') password: string) {
    await this.userService.updatePassword(userId, password);
    return { message: 'Password updated successfully' };
  }

  @Put(':userId/image')
  async uploadUserImage(@Param('userId') userId: string, @Body('imageUrl') imageUrl: string) {
    await this.userService.uploadUserImage(userId, imageUrl);
    return { message: 'User image uploaded successfully' };
  }

  @Delete(':userId/image')
  async deleteUserImage(@Param('userId') userId: string) {
    await this.userService.deleteUserImage(userId);
    return { message: 'User image deleted successfully' };
  }

  @Put(':userId/profile')
  async updateNicknameBlogName(
    @Param('userId') userId: string,
    @Body('nickname') nickname: string,
    @Body('blogName') blogName: string,
  ) {
    await this.userService.updateNicknameBlogName(userId, nickname, blogName);
    return { message: 'User profile updated successfully' };
  }

  @Put(':userId/email')
  async updateEmail(@Param('userId') userId: string, @Body('email') email: string) {
    await this.userService.updateEmail(userId, email);
    return { message: 'Email updated successfully' };
  }

  @Delete(':userId')
  async deleteUser(@Param('userId') userId: string) {
    await this.userService.deleteUser(userId);
    return { message: 'User deleted successfully' };
  }

  @Public()
  @Post('verifyCode')
  async createVerifyCode(@Body(ValidationPipe) createVerifyCodeDto: CreateVerifyCodeDto) {
    return this.userService.createVerifyCode(createVerifyCodeDto);
  }

  @Public()
  @Get('verifyCode/:code')
  async getVerifyCode(@Param('code') code: string) {
    const verifyCode = await this.userService.getVerifyCode(code);
    if (!verifyCode) {
      throw new HttpException('Verify code not found', HttpStatus.NOT_FOUND);
    }
    return verifyCode;
  }

  @Public()
  @Delete('verifyCode/:code')
  async deleteVerifyCode(@Param('code') code: string) {
    await this.userService.deleteVerifyCode(code);
    return { message: 'Verify code deleted successfully' };
  }

  @Post('tokens')
  async createUserToken(@Body(ValidationPipe) createUserTokenDto: CreateUserTokenDto) {
    return this.userService.createUserToken(createUserTokenDto);
  }

  @Get('tokens/:token')
  async getUserToken(@Param('token') token: string) {
    const userToken = await this.userService.getUserToken(token);
    if (!userToken) {
      throw new HttpException('Token not found', HttpStatus.NOT_FOUND);
    }
    return userToken;
  }

  @Delete('tokens')
  async deleteUserToken(@Query('token') token: string, @Query('userId') userId: string) {
    const deleteUserTokenDto: DeleteUserTokenDto = { token, userId };
    await this.userService.deleteUserToken(deleteUserTokenDto);
    return { message: 'User token deleted successfully' };
  }
}
