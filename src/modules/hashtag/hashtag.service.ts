import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { HashtagRepository, HashtagWithPost, HashtagInfo } from './hashtag.repository';
import { CreateHashtagDto } from './dto/create-hashtag.dto';
import { HashtagQueryDto } from './dto/hashtag-query.dto';
import { Hashtag } from './entities/hashtag.entity';

@Injectable()
export class HashtagService {
  constructor(private readonly hashtagRepository: HashtagRepository) {}

  // 포스트별 또는 사용자별 해시태그 조회
  async getHashtagsByPost(params: HashtagQueryDto): Promise<HashtagWithPost[]> {
    return this.hashtagRepository.getHashtagsByPost({
      postId: params.postId,
      userId: params.id,
    });
  }

  // 사용자별 해시태그 정보 조회
  async getHashtags(userId: string): Promise<HashtagInfo[]> {
    return this.hashtagRepository.getHashtags(userId);
  }

  // 해시태그 이름으로 조회
  async findHashtagByName(hashtagName: string): Promise<Hashtag | null> {
    return this.hashtagRepository.findHashtagByName(hashtagName);
  }

  // 해시태그가 존재하는지 확인하고, 없으면 생성
  async findOrCreateHashtag(hashtagName: string): Promise<Hashtag> {
    let hashtag = await this.hashtagRepository.findHashtagByName(hashtagName);

    if (!hashtag) {
      hashtag = await this.hashtagRepository.createHashtag({ hashtagName });
    }

    return hashtag;
  }

  // 새 해시태그 생성
  async createHashtag(createHashtagDto: CreateHashtagDto): Promise<Hashtag> {
    // 중복 해시태그 확인
    const existingHashtag = await this.hashtagRepository.findHashtagByName(createHashtagDto.hashtagName);
    if (existingHashtag) {
      throw new ConflictException('Hashtag already exists');
    }

    return this.hashtagRepository.createHashtag(createHashtagDto);
  }

  // 모든 해시태그 조회
  async getAllHashtags(): Promise<Hashtag[]> {
    return this.hashtagRepository.getAllHashtags();
  }

  // ID로 해시태그 조회
  async getHashtagById(hashtagId: number): Promise<Hashtag> {
    const hashtag = await this.hashtagRepository.getHashtagById(hashtagId);
    if (!hashtag) {
      throw new NotFoundException('Hashtag not found');
    }
    return hashtag;
  }

  // 해시태그 삭제
  async deleteHashtag(hashtagId: number): Promise<void> {
    const hashtag = await this.hashtagRepository.getHashtagById(hashtagId);
    if (!hashtag) {
      throw new NotFoundException('Hashtag not found');
    }

    // 해시태그를 삭제 (PostTag 관계는 PostTagService에서 관리)
    await this.hashtagRepository.deleteHashtagById(hashtagId);
  }

  // 해시태그 이름으로 검색
  async searchHashtagsByName(searchTerm: string): Promise<Hashtag[]> {
    return this.hashtagRepository.searchHashtagsByName(searchTerm);
  }

  // 해시태그 업데이트
  async updateHashtag(hashtagId: number, hashtagName: string): Promise<Hashtag> {
    const hashtag = await this.hashtagRepository.getHashtagById(hashtagId);
    if (!hashtag) {
      throw new NotFoundException('Hashtag not found');
    }

    // 중복 해시태그 확인 (자기 자신 제외)
    const existingHashtag = await this.hashtagRepository.findHashtagByName(hashtagName);
    if (existingHashtag && existingHashtag.hashtagId !== hashtagId) {
      throw new ConflictException('Hashtag name already exists');
    }

    await this.hashtagRepository.updateHashtag(hashtagId, hashtagName);
    return this.getHashtagById(hashtagId);
  }

  // 여러 해시태그 이름으로 해시태그 엔티티들 조회/생성
  async findOrCreateMultipleHashtags(hashtagNames: string[]): Promise<Hashtag[]> {
    const hashtags: Hashtag[] = [];

    for (const hashtagName of hashtagNames) {
      const hashtag = await this.findOrCreateHashtag(hashtagName);
      hashtags.push(hashtag);
    }

    return hashtags;
  }
}
