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
import { VerifyPasswordDto } from './dto/verify-password.dto';
import { CreateUserTokenDto, DeleteUserTokenDto } from './dto/user-token.dto';
import { Req, Res } from '@nestjs/common';
import { Public } from '../../core/auth/public.decorator';
import { buildRefreshCookieOptions, clearCookie, getCookie, setCookie } from '../../shared/utils';
import { FastifyReply } from 'fastify';
import '@fastify/cookie';

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
  async loginUser(@Body(ValidationPipe) loginUserDto: LoginUserDto, @Res({ passthrough: true }) res: FastifyReply) {
    const loginRes = await this.userService.loginUser(loginUserDto);
    if (!loginRes) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    const { accessToken, accessTokenExpireDate, refreshToken, user } = loginRes;
    setCookie(res, 'refreshToken', refreshToken, buildRefreshCookieOptions());
    return { accessToken, accessTokenExpireDate, user };
  }

  @Public()
  @Post('refresh')
  async refreshTokens(@Req() req: unknown, @Res({ passthrough: true }) res: FastifyReply) {
    const cookieToken = getCookie(req, 'refreshToken');
    const result = await this.userService.refreshTokens({ refreshToken: cookieToken ?? '' });
    if (!result) {
      throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
    }
    const { accessToken, accessTokenExpireDate, refreshToken, user } = result;
    setCookie(res, 'refreshToken', refreshToken, buildRefreshCookieOptions());
    return { accessToken, accessTokenExpireDate, user };
  }

  @Post('logout')
  async logout(@Req() req: unknown, @Res({ passthrough: true }) res: FastifyReply) {
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

  @Put('update/password')
  async updatePassword(@Req() req: unknown, @Body('password') password: string) {
    type RequestWithUser = { user?: { userId?: string } };
    const requesterId: string | undefined = (req as RequestWithUser)?.user?.userId;
    if (!requesterId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    await this.userService.updatePassword(requesterId, password);
    return { message: 'Password updated successfully' };
  }

  @Put('update/image')
  async uploadUserImage(@Req() req: unknown, @Body('imageUrl') imageUrl: string) {
    type RequestWithUser = { user?: { userId?: string } };
    const requesterId: string | undefined = (req as RequestWithUser)?.user?.userId;
    if (!requesterId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    await this.userService.uploadUserImage(requesterId, imageUrl);
    return { message: 'User image uploaded successfully' };
  }

  @Delete('delete/image')
  async deleteUserImage(@Req() req: unknown) {
    type RequestWithUser = { user?: { userId?: string } };
    const requesterId: string | undefined = (req as RequestWithUser)?.user?.userId;
    if (!requesterId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    await this.userService.deleteUserImage(requesterId);
    return { message: 'User image deleted successfully' };
  }

  @Put('update/profile')
  async updateNicknameBlogName(
    @Req() req: unknown,
    @Body('nickname') nickname: string,
    @Body('blogName') blogName: string,
  ) {
    type RequestWithUser = { user?: { userId?: string } };
    const requesterId: string | undefined = (req as RequestWithUser)?.user?.userId;
    if (!requesterId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    await this.userService.updateNicknameBlogName(requesterId, nickname, blogName);
    return { message: 'User profile updated successfully' };
  }

  @Put('update/email')
  async updateEmail(@Req() req: unknown, @Body('email') email: string) {
    type RequestWithUser = { user?: { userId?: string } };
    const requesterId: string | undefined = (req as RequestWithUser)?.user?.userId;
    if (!requesterId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    await this.userService.updateEmail(requesterId, email);
    return { message: 'Email updated successfully' };
  }

  @Delete('delete')
  async deleteUser(@Req() req: unknown) {
    type RequestWithUser = { user?: { userId?: string } };
    const requesterId: string | undefined = (req as RequestWithUser)?.user?.userId;
    if (!requesterId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    await this.userService.deleteUser(requesterId);
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

  @Post('verify/password')
  async verifyPassword(@Req() req: unknown, @Body(ValidationPipe) dto: VerifyPasswordDto) {
    type RequestWithUser = { user?: { userId?: string } };
    const requesterId: string | undefined = (req as RequestWithUser)?.user?.userId;
    if (!requesterId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    const isValid = await this.userService.verifyPassword(requesterId, dto.userPassword);
    return { isValid };
  }
}
