import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';
import { CreateLikeDto } from './dto/create-like.dto';
import { DeleteLikeDto } from './dto/delete-like.dto';
import { LikeQueryDto } from './dto/like-query.dto';
import { timeToString } from '../../shared/utils';

export interface LikeCountResult {
  userId: string;
  likeCnt: number;
}

export interface LikeCreateResult {
  likeactId: number;
  totalItems: number;
  items: LikeCountResult[];
}

@Injectable()
export class LikeRepository {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
  ) {}

  async getLikeCount(params: LikeQueryDto): Promise<LikeCountResult[]> {
    const { postId } = params;

    const result: LikeCountResult[] = await this.likeRepository
      .createQueryBuilder('like')
      .select(['like.user_id AS userId', 'COUNT(*) OVER (PARTITION BY like.post_id) AS likeCnt'])
      .where('like.post_id = :postId', { postId })
      .getRawMany();

    return result;
  }

  async createLike(createLikeDto: CreateLikeDto): Promise<Like> {
    const currentTime = timeToString(new Date());

    const like = this.likeRepository.create({
      userId: createLikeDto.userId,
      postId: createLikeDto.postId,
      rgsnDttm: currentTime,
      amntDttm: currentTime,
    });

    return this.likeRepository.save(like);
  }

  async deleteLike(deleteLikeDto: DeleteLikeDto): Promise<void> {
    const { userId, postId } = deleteLikeDto;

    await this.likeRepository.delete({
      userId,
      postId,
    });
  }

  async findExistingLike(userId: string, postId: number): Promise<Like | null> {
    return this.likeRepository.findOne({
      where: {
        userId,
        postId,
      },
    });
  }
}
