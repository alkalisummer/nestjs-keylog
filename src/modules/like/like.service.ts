import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { LikeRepository, LikeCountResult } from './like.repository';
import { CreateLikeDto } from './dto/create-like.dto';
import { DeleteLikeDto } from './dto/delete-like.dto';
import { LikeQueryDto } from './dto/like-query.dto';

export interface LikeResponse {
  totalItems: number;
  items: LikeCountResult[];
  likeactId?: number;
  refreshCnt?: LikeCountResult[];
}

@Injectable()
export class LikeService {
  constructor(private readonly likeRepository: LikeRepository) {}

  async getLikeCount(query: LikeQueryDto): Promise<LikeResponse> {
    const items = await this.likeRepository.getLikeCount(query);

    return {
      totalItems: items.length > 0 ? items[0].likeCnt : 0,
      items,
    };
  }

  async createLike(createLikeDto: CreateLikeDto): Promise<LikeResponse> {
    // Check if like already exists
    const existingLike = await this.likeRepository.findExistingLike(createLikeDto.userId, createLikeDto.postId);

    if (existingLike) {
      throw new ConflictException('User has already liked this post');
    }

    const createdLike = await this.likeRepository.createLike(createLikeDto);

    // Get updated like count
    const refreshCnt = await this.likeRepository.getLikeCount({
      postId: createLikeDto.postId,
    });

    return {
      totalItems: refreshCnt.length > 0 ? refreshCnt[0].likeCnt : 0,
      items: [],
      likeactId: createdLike.likeactId,
      refreshCnt,
    };
  }

  async deleteLike(deleteLikeDto: DeleteLikeDto): Promise<LikeResponse> {
    // Check if like exists
    const existingLike = await this.likeRepository.findExistingLike(deleteLikeDto.userId, deleteLikeDto.postId);

    if (!existingLike) {
      throw new NotFoundException('Like not found');
    }

    await this.likeRepository.deleteLike(deleteLikeDto);

    // Get updated like count
    const refreshCnt = await this.likeRepository.getLikeCount({
      postId: deleteLikeDto.postId,
    });

    return {
      totalItems: refreshCnt.length > 0 ? refreshCnt[0].likeCnt : 0,
      items: [],
      refreshCnt,
    };
  }
}
