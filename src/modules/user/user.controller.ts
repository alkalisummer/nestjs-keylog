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
  ParseIntPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

import { LoginUserDto } from './dto/login-user.dto';
import { CreateVerifyCodeDto } from './dto/verify-code.dto';
import { CreateUserTokenDto, DeleteUserTokenDto } from './dto/user-token.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':userId')
  async getUserById(@Param('userId') userId: string, @Query('email') userEmail?: string) {
    const user = await this.userService.getUserById(userId, userEmail);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  @Post('login')
  async loginUser(@Body(ValidationPipe) loginUserDto: LoginUserDto) {
    const user = await this.userService.loginUser(loginUserDto);
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }

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

  @Get(':userId/password')
  async getCurrentPassword(@Param('userId') userId: string) {
    const password = await this.userService.getCurrentPassword(userId);
    return { password };
  }

  @Delete(':userId')
  async deleteUser(@Param('userId') userId: string) {
    await this.userService.deleteUser(userId);
    return { message: 'User deleted successfully' };
  }

  @Post('verify-codes')
  async createVerifyCode(@Body(ValidationPipe) createVerifyCodeDto: CreateVerifyCodeDto) {
    return this.userService.createVerifyCode(createVerifyCodeDto);
  }

  @Get('verify-codes/:verifyCodeId')
  async getVerifyCode(@Param('verifyCodeId', ParseIntPipe) verifyCodeId: number) {
    const verifyCode = await this.userService.getVerifyCode(verifyCodeId);
    if (!verifyCode) {
      throw new HttpException('Verify code not found', HttpStatus.NOT_FOUND);
    }
    return verifyCode;
  }

  @Delete('verify-codes/:verifyCodeId')
  async deleteVerifyCode(@Param('verifyCodeId', ParseIntPipe) verifyCodeId: number) {
    await this.userService.deleteVerifyCode(verifyCodeId);
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
  async deleteUserToken(@Body(ValidationPipe) deleteUserTokenDto: DeleteUserTokenDto) {
    await this.userService.deleteUserToken(deleteUserTokenDto);
    return { message: 'User token deleted successfully' };
  }
}
