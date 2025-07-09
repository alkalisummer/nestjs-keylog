import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostTag } from './entities/post-tag.entity';
import { CreatePostTagDto } from './dto/create-post-tag.dto';
import { DeletePostTagDto } from './dto/delete-post-tag.dto';

export interface PostTagWithDetails {
  postId: number;
  hashtagId: number;
  hashtagName: string;
  postTitle: string;
  rgsnDttm: string;
}

export interface PostTagCount {
  postId: number;
  hashtagCount: number;
}

@Injectable()
export class PostTagRepository {
  constructor(
    @InjectRepository(PostTag)
    private readonly postTagRepository: Repository<PostTag>,
  ) {}

  // 포스트-태그 관계 생성
  async createPostTag(createPostTagDto: CreatePostTagDto): Promise<PostTag> {
    const postTag = this.postTagRepository.create({
      postId: createPostTagDto.postId,
      hashtagId: createPostTagDto.hashtagId,
    });

    return this.postTagRepository.save(postTag);
  }

  // 포스트-태그 관계 삭제
  async deletePostTag(deletePostTagDto: DeletePostTagDto): Promise<void> {
    await this.postTagRepository.delete({
      postId: deletePostTagDto.postId,
      hashtagId: deletePostTagDto.hashtagId,
    });
  }

  // 포스트별 해시태그 조회
  async getPostTagsByPostId(postId: number): Promise<PostTagWithDetails[]> {
    const result: PostTagWithDetails[] = await this.postTagRepository
      .createQueryBuilder('pt')
      .select([
        'pt.post_id AS postId',
        'pt.hashtag_id AS hashtagId',
        'h.hashtag_name AS hashtagName',
        'p.post_title AS postTitle',
        'p.rgsn_dttm AS rgsnDttm',
      ])
      .leftJoin('HASHTAG', 'h', 'pt.hashtag_id = h.hashtag_id')
      .leftJoin('POST', 'p', 'pt.post_id = p.post_id')
      .where('pt.post_id = :postId', { postId })
      .getRawMany();

    return result;
  }

  // 해시태그별 포스트 조회
  async getPostTagsByHashtagId(hashtagId: number): Promise<PostTagWithDetails[]> {
    const result: PostTagWithDetails[] = await this.postTagRepository
      .createQueryBuilder('pt')
      .select([
        'pt.post_id AS postId',
        'pt.hashtag_id AS hashtagId',
        'h.hashtag_name AS hashtagName',
        'p.post_title AS postTitle',
        'p.rgsn_dttm AS rgsnDttm',
      ])
      .leftJoin('HASHTAG', 'h', 'pt.hashtag_id = h.hashtag_id')
      .leftJoin('POST', 'p', 'pt.post_id = p.post_id')
      .where('pt.hashtag_id = :hashtagId', { hashtagId })
      .andWhere('p.temp_yn = :tempYn', { tempYn: 'N' })
      .orderBy('p.rgsn_dttm', 'DESC')
      .getRawMany();

    return result;
  }

  // 사용자별 포스트-태그 조회
  async getPostTagsByUserId(userId: string): Promise<PostTagWithDetails[]> {
    const result: PostTagWithDetails[] = await this.postTagRepository
      .createQueryBuilder('pt')
      .select([
        'pt.post_id AS postId',
        'pt.hashtag_id AS hashtagId',
        'h.hashtag_name AS hashtagName',
        'p.post_title AS postTitle',
        'p.rgsn_dttm AS rgsnDttm',
      ])
      .leftJoin('HASHTAG', 'h', 'pt.hashtag_id = h.hashtag_id')
      .leftJoin('POST', 'p', 'pt.post_id = p.post_id')
      .where('p.rgsr_id = :userId', { userId })
      .andWhere('p.temp_yn = :tempYn', { tempYn: 'N' })
      .orderBy('p.rgsn_dttm', 'DESC')
      .getRawMany();

    return result;
  }

  // 포스트별 해시태그 개수 조회
  async getHashtagCountByPost(): Promise<PostTagCount[]> {
    const result: PostTagCount[] = await this.postTagRepository
      .createQueryBuilder('pt')
      .select(['pt.post_id AS postId', 'COUNT(pt.hashtag_id) AS hashtagCount'])
      .groupBy('pt.post_id')
      .getRawMany();

    return result;
  }

  // 특정 포스트-해시태그 관계 존재 여부 확인
  async existsPostTag(postId: number, hashtagId: number): Promise<boolean> {
    const count = await this.postTagRepository.count({
      where: {
        postId,
        hashtagId,
      },
    });

    return count > 0;
  }

  // 포스트의 모든 해시태그 삭제
  async deletePostTagsByPostId(postId: number): Promise<void> {
    await this.postTagRepository.delete({ postId });
  }

  // 해시태그의 모든 포스트 태그 삭제
  async deletePostTagsByHashtagId(hashtagId: number): Promise<void> {
    await this.postTagRepository.delete({ hashtagId });
  }

  // 모든 포스트-태그 관계 조회
  async getAllPostTags(): Promise<PostTag[]> {
    return this.postTagRepository.find({
      relations: ['post', 'hashtag'],
    });
  }

  // 여러 포스트-태그 관계 일괄 생성
  async createMultiplePostTags(postTags: CreatePostTagDto[]): Promise<PostTag[]> {
    const entities = postTags.map((dto) =>
      this.postTagRepository.create({
        postId: dto.postId,
        hashtagId: dto.hashtagId,
      }),
    );

    return this.postTagRepository.save(entities);
  }
}
