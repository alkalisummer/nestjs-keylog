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

    const query = `
      SELECT A.COMMENT_ID,
             A.COMMENT_DEPTH,
             A.COMMENT_ORIGIN_ID,
             A.COMMENT_CNTN,
             A.RGSR_ID,
             A.RGSN_DTTM,
             B.USER_NICKNAME,
             B.USER_THMB_IMG_URL,
             COUNT(C.COMMENT_ID) AS REPLY_CNT
      FROM COMMENT A 
      LEFT JOIN USER B 
        ON A.RGSR_ID = B.USER_ID 
      LEFT JOIN COMMENT C
        ON A.COMMENT_ID = C.COMMENT_ORIGIN_ID
       AND C.COMMENT_DEPTH = 2
      WHERE A.POST_ID = ?
      GROUP BY A.COMMENT_ID
      ORDER BY A.COMMENT_DEPTH ASC, A.RGSN_DTTM ASC
    `;

    return this.commentRepository.query(query, [postId]);
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
    const query = `
      SELECT A.COMMENT_ID AS COMMENT_ID,
             A.COMMENT_CNTN AS COMMENT_CNTN,
             A.RGSN_DTTM AS RGSN_DTTM,
             A.POST_ID AS POST_ID,
             A.RGSR_ID AS RGSR_ID,
             C.USER_NICKNAME AS USER_NICKNAME
      FROM COMMENT A
      LEFT JOIN POST B              
        ON A.POST_ID = B.POST_ID 
      LEFT JOIN USER C
        ON A.RGSR_ID = C.USER_ID
      WHERE B.RGSR_ID = ?
      ORDER BY A.RGSN_DTTM DESC
      LIMIT ?
    `;

    return this.commentRepository.query(query, [rgsrId, limit]);
  }
}
