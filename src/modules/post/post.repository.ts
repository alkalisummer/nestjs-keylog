import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostListQueryDto } from './dto/post-list-query.dto';
import { timeToString } from '../../shared/utils';

export interface PostListItem {
  pageIndx: number;
  totalItems: number;
  postId: number;
  postTitle: string;
  postCntn: string;
  postThmbImgUrl: string;
  authorId: string;
  rgsnDttm: Date;
  userNickname: string;
  userThmbImgUrl: string;
  commentCnt: number;
  likeCnt: number;
  hashtagName?: string;
}

export interface PostDetail {
  postId: number;
  postTitle: string;
  postHtmlCntn: string;
  authorId: string;
  tempYn: string;
  amntDttm: Date;
}

export interface RecentPost {
  postId: number;
  postTitle: string;
  postThmbImgUrl: string;
  rgsnDttm: Date;
}

export interface PopularPost {
  postId: number;
  postTitle: string;
  postThmbImgUrl: string;
  rgsnDttm: Date;
  likeCnt: number;
}

@Injectable()
export class PostRepository {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async getPostList(params: PostListQueryDto): Promise<PostListItem[]> {
    const { authorId, perPage = 10, currPageNum = 1, searchWord, tempYn, tagId } = params;
    const sttRowNum = perPage * (currPageNum - 1) + 1;
    const endRowNum = sttRowNum + perPage - 1;

    // Build the base query with proper parameter handling
    const whereConditions = ['(A.post_origin_id IS NULL OR A.post_origin_id = ?)'];
    const parameters: (string | number)[] = [''];

    if (tagId) {
      whereConditions.push('E.hashtag_id = ?');
      parameters.push(tagId);
    }

    if (authorId) {
      whereConditions.push('A.rgsr_id = ?');
      parameters.push(authorId);
    }

    if (searchWord) {
      whereConditions.push('(A.post_title LIKE ? OR A.post_cntn LIKE ?)');
      parameters.push(`%${searchWord}%`);
      parameters.push(`%${searchWord}%`);
    }

    if (tempYn) {
      whereConditions.push('A.temp_yn = ?');
      parameters.push(tempYn);
    }

    const whereClause = whereConditions.join(' AND ');

    const baseQuery = `
      SELECT 
        ROW_NUMBER() OVER(ORDER BY A.rgsn_dttm DESC) AS pageIndx,
        COUNT(*) OVER() AS totalItems,
        A.post_id AS postId,
        A.post_title AS postTitle,
        A.post_cntn AS postCntn,
        A.post_thmb_img_url AS postThmbImgUrl,
        A.rgsr_id AS authorId,
        A.rgsn_dttm AS rgsnDttm,
        B.user_nickname AS userNickname,
        B.user_thmb_img_url AS userThmbImgUrl,
        COUNT(DISTINCT C.comment_id) AS commentCnt,
        COUNT(DISTINCT D.likeact_id) AS likeCnt
        ${tagId ? ', F.hashtag_name AS hashtagName' : ''}
      FROM POST A
      LEFT JOIN USER B ON A.rgsr_id = B.user_id
      LEFT JOIN COMMENT C ON A.post_id = C.post_id
      LEFT JOIN LIKEACT D ON A.post_id = D.post_id
      LEFT JOIN POST_TAG E ON A.post_id = E.post_id
      LEFT JOIN HASHTAG F ON E.hashtag_id = F.hashtag_id
      WHERE ${whereClause}
      GROUP BY A.post_id
    `;

    const subQuery = `
      SELECT * FROM (${baseQuery}) AS A 
      WHERE pageIndx >= ? AND pageIndx <= ? 
      ORDER BY pageIndx
    `;

    const finalParameters = [...parameters, sttRowNum, endRowNum] as (string | number)[];

    const result: PostListItem[] = await this.postRepository.query(subQuery, finalParameters);
    return result;
  }

  async getPostById(postId: number): Promise<PostDetail | undefined> {
    const result: PostDetail | undefined = await this.postRepository
      .createQueryBuilder('post')
      .select([
        'post.post_id AS postId',
        'post.post_title AS postTitle',
        'post.post_html_cntn AS postHtmlCntn',
        'post.rgsr_id AS authorId',
        'post.temp_yn AS tempYn',
        'post.amnt_dttm AS amntDttm',
      ])
      .where('post.post_id = :postId', { postId })
      .getRawOne();

    return result;
  }

  async createPost(createPostDto: CreatePostDto): Promise<Post> {
    const post = this.postRepository.create({
      postTitle: createPostDto.postTitle,
      postCntn: createPostDto.postCntn,
      postHtmlCntn: Buffer.from(createPostDto.postHtmlCntn, 'utf8'),
      postThmbImgUrl: createPostDto.postThmbImgUrl,
      authorId: createPostDto.authorId,
      tempYn: createPostDto.tempYn,
      postOriginId: createPostDto.postOriginId,
      rgsnDttm: timeToString(new Date()),
      amntDttm: timeToString(new Date()),
    });

    return this.postRepository.save(post);
  }

  async updatePost(updatePostDto: UpdatePostDto): Promise<void> {
    const { postId, ...updateData } = updatePostDto;

    const updatePayload: Partial<Post> = {
      postTitle: updateData.postTitle,
      postCntn: updateData.postCntn,
      postThmbImgUrl: updateData.postThmbImgUrl,
      tempYn: updateData.tempYn,
      amntDttm: timeToString(new Date()),
    };

    if (updateData.postHtmlCntn) {
      updatePayload.postHtmlCntn = Buffer.from(updateData.postHtmlCntn, 'utf8');
    }

    await this.postRepository.update(postId, updatePayload);
  }

  async deletePost(postId: number): Promise<void> {
    await this.postRepository.delete(postId);
  }

  async deletePostsByUserId(authorId: string): Promise<void> {
    await this.postRepository.delete({ authorId });
  }

  async getRecentPosts(authorId: string, limit: number = 3): Promise<RecentPost[]> {
    const result: RecentPost[] = await this.postRepository
      .createQueryBuilder('post')
      .select([
        'post.post_id AS postId',
        'post.post_title AS postTitle',
        'post.post_thmb_img_url AS postThmbImgUrl',
        'post.rgsn_dttm AS rgsnDttm',
      ])
      .where('post.rgsr_id = :authorId', { authorId })
      .andWhere('post.temp_yn = :tempYn', { tempYn: 'N' })
      .orderBy('post.rgsn_dttm', 'DESC')
      .limit(limit)
      .getRawMany();

    return result;
  }

  async getPopularPosts(authorId: string, limit: number = 3): Promise<PopularPost[]> {
    const subQuery = this.postRepository
      .createQueryBuilder('A')
      .select([
        'A.post_id AS postId',
        'A.post_title AS postTitle',
        'A.post_thmb_img_url AS postThmbImgUrl',
        'A.rgsn_dttm AS rgsnDttm',
        'COUNT(B.likeact_id) AS likeCnt',
      ])
      .leftJoin('LIKEACT', 'B', 'A.post_id = B.post_id')
      .where('A.rgsr_id = :authorId', { authorId })
      .andWhere('A.temp_yn = :tempYn', { tempYn: 'N' })
      .groupBy('A.post_id');

    const query = `SELECT * FROM (${subQuery.getQuery()}) AS A WHERE A.likeCnt > 0 ORDER BY A.likeCnt DESC, A.rgsnDttm DESC LIMIT ${limit}`;

    const parameters: any[] = [authorId, 'N'];
    const result: unknown = await this.postRepository.query(query, parameters);
    return result as PopularPost[];
  }

  async deleteTempPost(postOriginId: number): Promise<void> {
    await this.postRepository.delete({ postOriginId });
  }

  async getLastTempPost(postId: number): Promise<PostDetail | undefined> {
    const result: PostDetail | undefined = await this.postRepository
      .createQueryBuilder('post')
      .select([
        'post.post_id AS postId',
        'post.post_title AS postTitle',
        'post.post_html_cntn AS postHtmlCntn',
        'post.rgsr_id AS authorId',
        'post.temp_yn AS tempYn',
        'post.amnt_dttm AS amntDttm',
      ])
      .where('post.post_origin_id = :postId', { postId })
      .andWhere('post.temp_yn = :tempYn', { tempYn: 'Y' })
      .orderBy('post.rgsn_dttm', 'DESC')
      .getRawOne();

    return result;
  }
}
