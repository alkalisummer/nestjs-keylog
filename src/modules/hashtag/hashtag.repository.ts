import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hashtag } from './entities/hashtag.entity';
import { CreateHashtagDto } from './dto/create-hashtag.dto';

export interface HashtagWithPost {
  postId: number;
  hashtagId: number;
  hashtagName: string;
  rgsnDttm: string;
}

export interface HashtagInfo {
  hashtagId: number;
  hashtagName: string;
  hashtagCnt: number;
}

@Injectable()
export class HashtagRepository {
  constructor(
    @InjectRepository(Hashtag)
    private readonly hashtagRepository: Repository<Hashtag>,
  ) {}

  // getHashtag 기능 - 포스트별 해시태그 조회 또는 사용자별 해시태그 조회
  async getHashtagsByPost(params: { postId?: string; userId?: string }): Promise<HashtagWithPost[]> {
    const { postId, userId } = params;

    let query = this.hashtagRepository
      .createQueryBuilder('B')
      .select([
        'A.post_id AS postId',
        'A.hashtag_id AS hashtagId',
        'B.hashtag_name AS hashtagName',
        'C.rgsn_dttm AS rgsnDttm',
      ])
      .leftJoin('POST_TAG', 'A', 'A.hashtag_id = B.hashtag_id')
      .leftJoin('POST', 'C', 'A.post_id = C.post_id')
      .where('1=1');

    if (postId) {
      query = query.andWhere('A.post_id = :postId', { postId });
    }

    if (userId) {
      query = query
        .andWhere('C.rgsr_id = :userId', { userId })
        .andWhere('C.temp_yn = :tempYn', { tempYn: 'N' })
        .orderBy('C.rgsn_dttm', 'DESC');
    }

    const result: HashtagWithPost[] = await query.getRawMany();
    return result;
  }

  // getHashtags기능 - 사용자별 해시태그 정보 조회
  async getHashtags(userId: string): Promise<HashtagInfo[]> {
    const result: HashtagInfo[] = await this.hashtagRepository
      .createQueryBuilder('B')
      .select(['A.hashtag_id AS hashtagId', 'B.hashtag_name AS hashtagName', 'COUNT(*) AS hashtagCnt'])
      .leftJoin('POST_TAG', 'A', 'A.hashtag_id = B.hashtag_id')
      .leftJoin('POST', 'C', 'A.post_id = C.post_id')
      .where('C.rgsr_id = :userId', { userId })
      .andWhere('C.temp_yn = :tempYn', { tempYn: 'N' })
      .groupBy('A.hashtag_id')
      .orderBy('B.hashtag_name', 'ASC')
      .getRawMany();

    return result;
  }

  // checkHashtag 기능 - 해시태그 존재 여부 확인
  async findHashtagByName(hashtagName: string): Promise<Hashtag | null> {
    const result = await this.hashtagRepository
      .createQueryBuilder('hashtag')
      .where('UPPER(hashtag.hashtag_name) = UPPER(:hashtagName)', { hashtagName })
      .getOne();

    return result;
  }

  // insertHashtag 기능 - 새 해시태그 생성
  async createHashtag(createHashtagDto: CreateHashtagDto): Promise<Hashtag> {
    const hashtag = this.hashtagRepository.create({
      hashtagName: createHashtagDto.hashtagName,
    });

    return this.hashtagRepository.save(hashtag);
  }

  // 추가 유틸리티 메서드들
  async getAllHashtags(): Promise<Hashtag[]> {
    return this.hashtagRepository.find();
  }

  async getHashtagById(hashtagId: number): Promise<Hashtag | null> {
    return this.hashtagRepository.findOne({ where: { hashtagId } });
  }

  async deleteHashtagById(hashtagId: number): Promise<void> {
    await this.hashtagRepository.delete(hashtagId);
  }

  // 해시태그 이름으로 검색 (부분 일치)
  async searchHashtagsByName(searchTerm: string): Promise<Hashtag[]> {
    return this.hashtagRepository
      .createQueryBuilder('hashtag')
      .where('hashtag.hashtag_name LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .getMany();
  }

  // 해시태그 업데이트
  async updateHashtag(hashtagId: number, hashtagName: string): Promise<void> {
    await this.hashtagRepository.update(hashtagId, { hashtagName });
  }
}
