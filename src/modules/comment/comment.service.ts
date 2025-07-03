import { Injectable } from '@nestjs/common';
import { CommentRepository, RecentComment, CommentResponse } from './comment.repository';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentListQueryDto } from './dto/comment-list-query.dto';

@Injectable()
export class CommentService {
  constructor(private readonly commentRepository: CommentRepository) {}

  async getCommentList(query: CommentListQueryDto): Promise<CommentResponse> {
    const items = await this.commentRepository.getCommentList(query);

    return {
      totalItems: items.length,
      items,
    };
  }

  async createComment(createCommentDto: CreateCommentDto): Promise<CommentResponse> {
    const comment = await this.commentRepository.createComment(createCommentDto);

    // 댓글 작성 후 전체 댓글 리스트 재조회
    const refreshList = await this.commentRepository.getCommentList({
      postId: createCommentDto.postId,
    });

    return {
      totalItems: 0,
      items: [],
      commentId: comment.commentId,
      refreshList,
    };
  }

  async createReply(createReplyDto: CreateReplyDto): Promise<CommentResponse> {
    const reply = await this.commentRepository.createReply(createReplyDto);

    // 답글 작성 후 전체 댓글 리스트 재조회
    const refreshList = await this.commentRepository.getCommentList({
      postId: createReplyDto.postId,
    });

    return {
      totalItems: 0,
      items: [],
      commentId: reply.commentId,
      refreshList,
    };
  }

  async updateComment(updateCommentDto: UpdateCommentDto, postId: number): Promise<CommentResponse> {
    await this.commentRepository.updateComment(updateCommentDto);

    // 댓글 수정 후 전체 댓글 리스트 재조회
    const refreshList = await this.commentRepository.getCommentList({ postId });

    return {
      totalItems: 0,
      items: [],
      refreshList,
    };
  }

  async deleteComment(commentId: number, postId: number): Promise<CommentResponse> {
    await this.commentRepository.deleteComment(commentId);

    // 댓글 삭제 후 전체 댓글 리스트 재조회
    const refreshList = await this.commentRepository.getCommentList({ postId });

    return {
      totalItems: 0,
      items: [],
      refreshList,
    };
  }

  async getRecentComments(authorId: string, limit?: number): Promise<RecentComment[]> {
    return this.commentRepository.getRecentComments(authorId, limit);
  }
}
