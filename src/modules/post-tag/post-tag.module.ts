import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostTagController } from './post-tag.controller';
import { PostTagService } from './post-tag.service';
import { PostTagRepository } from './post-tag.repository';
import { PostTag } from './entities/post-tag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostTag])],
  controllers: [PostTagController],
  providers: [PostTagService, PostTagRepository],
  exports: [PostTagService, PostTagRepository],
})
export class PostTagModule {}
