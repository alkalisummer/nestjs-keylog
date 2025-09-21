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
  postId: number;
  commentId: number;
  commentDepth: number;
  commentOriginId: number;
  commentCntn: string;
  authorId: string;
  rgsnDttm: string;
  userNickname: string;
  userThmbImgUrl: string;
  replyCnt: number;
}

export interface CommentRes {
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
        'A.post_id AS postId',
        'A.comment_id AS commentId',
        'A.comment_depth AS commentDepth',
        'A.comment_origin_id AS commentOriginId',
        'A.comment_cntn AS commentCntn',
        'A.rgsr_id AS authorId',
        'A.rgsn_dttm AS rgsnDttm',
        'B.user_nickname AS userNickname',
        'B.user_thmb_img_url AS userThmbImgUrl',
        'COUNT(C.comment_id) AS replyCnt',
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
      authorId: createCommentDto.authorId,
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
      authorId: createReplyDto.authorId,
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

  async getRecentComments(authorId: string, limit: number = 3): Promise<Partial<CommentListItem>[]> {
    const result: Partial<CommentListItem>[] = await this.commentRepository
      .createQueryBuilder('A')
      .select([
        'A.comment_id AS commentId',
        'A.comment_cntn AS commentCntn',
        'A.rgsn_dttm AS rgsnDttm',
        'A.post_id AS postId',
        'A.rgsr_id AS authorId',
        'C.user_nickname AS userNickname',
      ])
      .leftJoin('POST', 'B', 'A.post_id = B.post_id')
      .leftJoin('USER', 'C', 'A.rgsr_id = C.user_id')
      .where('B.rgsr_id = :authorId', { authorId })
      .orderBy('A.rgsn_dttm', 'DESC')
      .limit(limit)
      .getRawMany();

    return result;
  }
}
