import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { User } from './entities/user.entity';
import { VerifyCode } from './entities/verify-code.entity';
import { UserToken } from './entities/user-token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, VerifyCode, UserToken])],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository],
})
export class UserModule {}
