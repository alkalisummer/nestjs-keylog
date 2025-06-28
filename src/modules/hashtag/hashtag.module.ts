import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HashtagController } from './hashtag.controller';
import { HashtagService } from './hashtag.service';
import { HashtagRepository } from './hashtag.repository';
import { Hashtag } from './entities/hashtag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Hashtag])],
  controllers: [HashtagController],
  providers: [HashtagService, HashtagRepository],
  exports: [HashtagService, HashtagRepository],
})
export class HashtagModule {}
