import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostModule } from './modules/post/post.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.CLOUD_MYSQL_HOST || 'localhost',
      port: parseInt(process.env.CLOUD_MYSQL_PORT || '3306', 10),
      username: process.env.CLOUD_MYSQL_USER || 'root',
      password: process.env.CLOUD_MYSQL_PASSWORD || '',
      database: process.env.CLOUD_MYSQL_DATABASE_NM || 'keylog',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
      charset: 'utf8mb4',
      timezone: '+09:00',
    }),
    PostModule,
    UserModule,
  ],
})
export class AppModule {}
