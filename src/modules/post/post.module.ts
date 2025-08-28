import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { PostRepository } from './post.repository';
import { Post } from './entities/post.entity';
import { HashtagModule } from '../hashtag/hashtag.module';
import { PostTagModule } from '../post-tag/post-tag.module';

@Module({
  imports: [TypeOrmModule.forFeature([Post]), HashtagModule, PostTagModule],
  controllers: [PostController],
  providers: [PostService, PostRepository],
  exports: [PostService, PostRepository],
})
export class PostModule {}
