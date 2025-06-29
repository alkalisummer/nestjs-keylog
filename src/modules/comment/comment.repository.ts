import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentListQueryDto } from './dto/comment-list-query.dto';
import { timeToString } from '../../shared/utils';

export interface CommentListItem {
  COMMENT_ID: number;
  COMMENT_DEPTH: number;
  COMMENT_ORIGIN_ID: number;
  COMMENT_CNTN: string;
  RGSR_ID: string;
  RGSN_DTTM: string;
  USER_NICKNAME: string;
  USER_THMB_IMG_URL: string;
  REPLY_CNT: number;
}

export interface RecentComment {
  COMMENT_ID: number;
  COMMENT_CNTN: string;
  RGSN_DTTM: string;
  POST_ID: number;
  RGSR_ID: string;
  USER_NICKNAME: string;
}

export interface CommentResponse {
  totalItems: number;
  items: CommentListItem[];
  commentId?: number;
  refreshList?: CommentListItem[];
}

@Injectable()
export class CommentRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async getCommentList(params: CommentListQueryDto): Promise<CommentListItem[]> {
    const { postId } = params;

    const result: CommentListItem[] = await this.commentRepository
      .createQueryBuilder('A')
      .select([
        'A.comment_id AS COMMENT_ID',
        'A.comment_depth AS COMMENT_DEPTH',
        'A.comment_origin_id AS COMMENT_ORIGIN_ID',
        'A.comment_cntn AS COMMENT_CNTN',
        'A.rgsr_id AS RGSR_ID',
        'A.rgsn_dttm AS RGSN_DTTM',
        'B.user_nickname AS USER_NICKNAME',
        'B.user_thmb_img_url AS USER_THMB_IMG_URL',
        'COUNT(C.comment_id) AS REPLY_CNT',
      ])
      .leftJoin('USER', 'B', 'A.rgsr_id = B.user_id')
      .leftJoin('COMMENT', 'C', 'A.comment_id = C.comment_origin_id AND C.comment_depth = 2')
      .where('A.post_id = :postId', { postId })
      .groupBy('A.comment_id')
      .orderBy('A.comment_depth', 'ASC')
      .addOrderBy('A.rgsn_dttm', 'ASC')
      .getRawMany();

    return result;
  }

  async createComment(createCommentDto: CreateCommentDto): Promise<Comment> {
    const currentTime = timeToString(new Date());

    const comment = this.commentRepository.create({
      postId: createCommentDto.postId,
      commentDepth: 1,
      commentCntn: createCommentDto.commentCntn,
      rgsrId: createCommentDto.rgsrId,
      rgsnDttm: currentTime,
      amntDttm: currentTime,
    });

    return this.commentRepository.save(comment);
  }

  async createReply(createReplyDto: CreateReplyDto): Promise<Comment> {
    const currentTime = timeToString(new Date());

    const reply = this.commentRepository.create({
      postId: createReplyDto.postId,
      commentOriginId: createReplyDto.commentOriginId,
      commentDepth: 2,
      commentCntn: createReplyDto.commentCntn,
      rgsrId: createReplyDto.rgsrId,
      rgsnDttm: currentTime,
      amntDttm: currentTime,
    });

    return this.commentRepository.save(reply);
  }

  async updateComment(updateCommentDto: UpdateCommentDto): Promise<void> {
    const { commentId, commentCntn } = updateCommentDto;
    const currentTime = timeToString(new Date());

    await this.commentRepository.update(commentId, {
      commentCntn,
      amntDttm: currentTime,
    });
  }

  async deleteComment(commentId: number): Promise<void> {
    // 원댓글과 답글 모두 삭제
    await this.commentRepository
      .createQueryBuilder()
      .delete()
      .from(Comment)
      .where('comment_id = :commentId OR comment_origin_id = :commentId', { commentId })
      .execute();
  }

  async getRecentComments(rgsrId: string, limit: number = 3): Promise<RecentComment[]> {
    const result: RecentComment[] = await this.commentRepository
      .createQueryBuilder('A')
      .select([
        'A.comment_id AS COMMENT_ID',
        'A.comment_cntn AS COMMENT_CNTN',
        'A.rgsn_dttm AS RGSN_DTTM',
        'A.post_id AS POST_ID',
        'A.rgsr_id AS RGSR_ID',
        'C.user_nickname AS USER_NICKNAME',
      ])
      .leftJoin('POST', 'B', 'A.post_id = B.post_id')
      .leftJoin('USER', 'C', 'A.rgsr_id = C.user_id')
      .where('B.rgsr_id = :rgsrId', { rgsrId })
      .orderBy('A.rgsn_dttm', 'DESC')
      .limit(limit)
      .getRawMany();

    return result;
  }
}
