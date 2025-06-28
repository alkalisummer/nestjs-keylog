import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostListQueryDto } from './dto/post-list-query.dto';
import { timeToString } from '../../shared/utils';

export interface PostListItem {
  PAGE_INDX: number;
  TOTAL_ITEMS: number;
  POST_ID: number;
  POST_TITLE: string;
  POST_CNTN: string;
  POST_THMB_IMG_URL: string;
  RGSR_ID: string;
  RGSN_DTTM: Date;
  USER_NICKNAME: string;
  USER_THMB_IMG_URL: string;
  COMMENT_CNT: number;
  LIKE_CNT: number;
  HASHTAG_NAME?: string;
}

export interface PostDetail {
  POST_ID: number;
  POST_TITLE: string;
  POST_HTML_CNTN: string;
  RGSR_ID: string;
  TEMP_YN: string;
  AMNT_DTTM: Date;
}

export interface RecentPost {
  POST_ID: number;
  POST_TITLE: string;
  POST_THMB_IMG_URL: string;
  RGSN_DTTM: Date;
}

export interface PopularPost {
  POST_ID: number;
  POST_TITLE: string;
  POST_THMB_IMG_URL: string;
  RGSN_DTTM: Date;
  LIKE_CNT: number;
}

@Injectable()
export class PostRepository {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async getPostList(params: PostListQueryDto): Promise<PostListItem[]> {
    const { id: rgsrId, perPage = 10, currPageNum = 1, searchWord, tempYn, tagId } = params;
    const sttRowNum = perPage * (currPageNum - 1) + 1;

    let query = this.postRepository
      .createQueryBuilder('A')
      .select([
        'ROW_NUMBER() OVER(ORDER BY A.rgsn_dttm DESC) AS PAGE_INDX',
        'COUNT(*) OVER() AS TOTAL_ITEMS',
        'A.post_id AS POST_ID',
        'A.post_title AS POST_TITLE',
        'A.post_cntn AS POST_CNTN',
        'A.post_thmb_img_url AS POST_THMB_IMG_URL',
        'A.rgsr_id AS RGSR_ID',
        'A.rgsn_dttm AS RGSN_DTTM',
        'B.user_nickname AS USER_NICKNAME',
        'B.user_thmb_img_url AS USER_THMB_IMG_URL',
        'COUNT(DISTINCT C.comment_id) AS COMMENT_CNT',
        'COUNT(DISTINCT D.likeact_id) AS LIKE_CNT',
      ])
      .leftJoin('user', 'B', 'A.rgsr_id = B.user_id')
      .leftJoin('comment', 'C', 'A.post_id = C.post_id')
      .leftJoin('likeact', 'D', 'A.post_id = D.post_id')
      .leftJoin('post_tag', 'E', 'A.post_id = E.post_id')
      .leftJoin('hashtag', 'F', 'E.hashtag_id = F.hashtag_id')
      .where('(A.post_origin_id IS NULL OR A.post_origin_id = :emptyString)', {
        emptyString: '',
      })
      .groupBy('A.post_id');

    if (tagId) {
      query = query.addSelect('F.hashtag_name AS HASHTAG_NAME');
      query = query.andWhere('E.hashtag_id = :tagId', { tagId });
    }

    if (rgsrId) {
      query = query.andWhere('A.rgsr_id = :rgsrId', { rgsrId });
    }

    if (searchWord) {
      query = query.andWhere('(A.post_title LIKE :searchWord OR A.post_cntn LIKE :searchWord)', {
        searchWord: `%${searchWord}%`,
      });
    }

    if (tempYn) {
      query = query.andWhere('A.temp_yn = :tempYn', { tempYn });
    }

    // Fix: Use raw SQL with proper parameter binding
    const baseQuery = query.getQuery().replace(/:(\w+)/g, '?');
    const parameters: any[] = Object.values(query.getParameters());

    const subQuery = `SELECT * FROM (${baseQuery}) AS A WHERE PAGE_INDX >= ${sttRowNum} AND PAGE_INDX <= ${sttRowNum + perPage - 1} ORDER BY PAGE_INDX`;

    const result: PostListItem[] = await this.postRepository.query(subQuery, parameters);
    return result;
  }

  async getPostById(postId: number): Promise<PostDetail | undefined> {
    const result: PostDetail | undefined = await this.postRepository
      .createQueryBuilder('post')
      .select([
        'post.post_id AS POST_ID',
        'post.post_title AS POST_TITLE',
        'post.post_html_cntn AS POST_HTML_CNTN',
        'post.rgsr_id AS RGSR_ID',
        'post.temp_yn AS TEMP_YN',
        'post.amnt_dttm AS AMNT_DTTM',
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
      rgsrId: createPostDto.rgsrId,
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

  async deletePostsByUserId(rgsrId: string): Promise<void> {
    await this.postRepository.delete({ rgsrId });
  }

  async getRecentPosts(rgsrId: string, limit: number = 3): Promise<RecentPost[]> {
    const result: RecentPost[] = await this.postRepository
      .createQueryBuilder('post')
      .select([
        'post.post_id AS POST_ID',
        'post.post_title AS POST_TITLE',
        'post.post_thmb_img_url AS POST_THMB_IMG_URL',
        'post.rgsn_dttm AS RGSN_DTTM',
      ])
      .where('post.rgsr_id = :rgsrId', { rgsrId })
      .andWhere('post.temp_yn = :tempYn', { tempYn: 'N' })
      .orderBy('post.rgsn_dttm', 'DESC')
      .limit(limit)
      .getRawMany();

    return result;
  }

  async getPopularPosts(rgsrId: string, limit: number = 3): Promise<PopularPost[]> {
    const subQuery = this.postRepository
      .createQueryBuilder('A')
      .select([
        'A.post_id AS POST_ID',
        'A.post_title AS POST_TITLE',
        'A.post_thmb_img_url AS POST_THMB_IMG_URL',
        'A.rgsn_dttm AS RGSN_DTTM',
        'COUNT(B.likeact_id) AS LIKE_CNT',
      ])
      .leftJoin('likeact', 'B', 'A.post_id = B.post_id')
      .where('A.rgsr_id = :rgsrId', { rgsrId })
      .andWhere('A.temp_yn = :tempYn', { tempYn: 'N' })
      .groupBy('A.post_id');

    const query = `SELECT * FROM (${subQuery.getQuery()}) AS A WHERE A.LIKE_CNT > 0 ORDER BY A.LIKE_CNT DESC, A.RGSN_DTTM DESC LIMIT ${limit}`;

    const parameters: any[] = [rgsrId, 'N'];
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
        'post.post_id AS POST_ID',
        'post.post_title AS POST_TITLE',
        'post.post_html_cntn AS POST_HTML_CNTN',
        'post.temp_yn AS TEMP_YN',
        'post.rgsn_dttm AS RGSN_DTTM',
      ])
      .where('post.post_origin_id = :postId', { postId })
      .orderBy('post.rgsn_dttm', 'DESC')
      .limit(1)
      .getRawOne();

    return result;
  }
}
