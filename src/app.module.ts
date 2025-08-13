import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostModule } from './modules/post/post.module';
import { UserModule } from './modules/user/user.module';
import { CommentModule } from './modules/comment/comment.module';
import { HashtagModule } from './modules/hashtag/hashtag.module';
import { PostTagModule } from './modules/post-tag/post-tag.module';
import { LikeModule } from './modules/like/like.module';
import { AuthModule } from './core/auth/auth.module';

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
      // Connection pool settings
      extra: {
        connectionLimit: 10,
        acquireTimeout: 60000,
        waitForConnections: true,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
      },
      // Retry settings
      retryAttempts: 3,
      retryDelay: 3000,
    }),
    PostModule,
    UserModule,
    CommentModule,
    HashtagModule,
    PostTagModule,
    LikeModule,
    AuthModule,
  ],
})
export class AppModule {}
