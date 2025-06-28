import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PostTagRepository, PostTagWithDetails, PostTagCount } from './post-tag.repository';
import { CreatePostTagDto } from './dto/create-post-tag.dto';
import { DeletePostTagDto } from './dto/delete-post-tag.dto';
import { PostTagQueryDto } from './dto/post-tag-query.dto';
import { PostTag } from './entities/post-tag.entity';

@Injectable()
export class PostTagService {
  constructor(private readonly postTagRepository: PostTagRepository) {}

  // 포스트-태그 관계 생성
  async createPostTag(createPostTagDto: CreatePostTagDto): Promise<PostTag> {
    // 중복 관계 확인
    const exists = await this.postTagRepository.existsPostTag(createPostTagDto.postId, createPostTagDto.hashtagId);

    if (exists) {
      throw new ConflictException('Post-tag relationship already exists');
    }

    return this.postTagRepository.createPostTag(createPostTagDto);
  }

  // 포스트-태그 관계 삭제
  async deletePostTag(deletePostTagDto: DeletePostTagDto): Promise<void> {
    const exists = await this.postTagRepository.existsPostTag(deletePostTagDto.postId, deletePostTagDto.hashtagId);

    if (!exists) {
      throw new NotFoundException('Post-tag relationship not found');
    }

    await this.postTagRepository.deletePostTag(deletePostTagDto);
  }

  // 조건에 따른 포스트-태그 조회
  async getPostTags(query: PostTagQueryDto): Promise<PostTagWithDetails[]> {
    if (query.postId) {
      return this.postTagRepository.getPostTagsByPostId(query.postId);
    }

    if (query.hashtagId) {
      return this.postTagRepository.getPostTagsByHashtagId(query.hashtagId);
    }

    if (query.userId) {
      return this.postTagRepository.getPostTagsByUserId(query.userId);
    }

    // 조건이 없으면 빈 배열 반환
    return [];
  }

  // 포스트별 해시태그 조회
  async getPostTagsByPostId(postId: number): Promise<PostTagWithDetails[]> {
    return this.postTagRepository.getPostTagsByPostId(postId);
  }

  // 해시태그별 포스트 조회
  async getPostTagsByHashtagId(hashtagId: number): Promise<PostTagWithDetails[]> {
    return this.postTagRepository.getPostTagsByHashtagId(hashtagId);
  }

  // 사용자별 포스트-태그 조회
  async getPostTagsByUserId(userId: string): Promise<PostTagWithDetails[]> {
    return this.postTagRepository.getPostTagsByUserId(userId);
  }

  // 포스트별 해시태그 개수 조회
  async getHashtagCountByPost(): Promise<PostTagCount[]> {
    return this.postTagRepository.getHashtagCountByPost();
  }

  // 포스트의 모든 해시태그 삭제
  async deletePostTagsByPostId(postId: number): Promise<void> {
    await this.postTagRepository.deletePostTagsByPostId(postId);
  }

  // 해시태그의 모든 포스트 태그 삭제
  async deletePostTagsByHashtagId(hashtagId: number): Promise<void> {
    await this.postTagRepository.deletePostTagsByHashtagId(hashtagId);
  }

  // 모든 포스트-태그 관계 조회
  async getAllPostTags(): Promise<PostTag[]> {
    return this.postTagRepository.getAllPostTags();
  }

  // 포스트에 여러 해시태그 연결
  async addHashtagsToPost(postId: number, hashtagIds: number[]): Promise<PostTag[]> {
    // 기존 관계들 확인하고 중복 제거
    const newRelations: CreatePostTagDto[] = [];

    for (const hashtagId of hashtagIds) {
      const exists = await this.postTagRepository.existsPostTag(postId, hashtagId);
      if (!exists) {
        newRelations.push({ postId, hashtagId });
      }
    }

    if (newRelations.length === 0) {
      return [];
    }

    return this.postTagRepository.createMultiplePostTags(newRelations);
  }

  // 포스트의 해시태그 업데이트 (기존 삭제 후 새로 추가)
  async updatePostHashtags(postId: number, hashtagIds: number[]): Promise<PostTag[]> {
    // 기존 해시태그 연결 모두 삭제
    await this.deletePostTagsByPostId(postId);

    // 새로운 해시태그들 연결
    const createDtos: CreatePostTagDto[] = hashtagIds.map((hashtagId) => ({
      postId,
      hashtagId,
    }));

    return this.postTagRepository.createMultiplePostTags(createDtos);
  }

  // 관계 존재 여부 확인
  async existsPostTag(postId: number, hashtagId: number): Promise<boolean> {
    return this.postTagRepository.existsPostTag(postId, hashtagId);
  }
}
