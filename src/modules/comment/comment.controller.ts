import { Controller, Get, Post, Put, Delete, Param, Body, Query, ParseIntPipe, ValidationPipe } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentListQueryDto } from './dto/comment-list-query.dto';
import { Public } from '../../core/auth/public.decorator';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Public()
  @Get()
  async getCommentList(@Query(new ValidationPipe({ transform: true })) query: CommentListQueryDto) {
    return this.commentService.getCommentList(query);
  }

  @Post()
  async createComment(@Body(ValidationPipe) createCommentDto: CreateCommentDto) {
    return this.commentService.createComment(createCommentDto);
  }

  @Post('reply')
  async createReply(@Body(ValidationPipe) createReplyDto: CreateReplyDto) {
    return this.commentService.createReply(createReplyDto);
  }

  @Put(':id')
  async updateComment(
    @Param('id', ParseIntPipe) commentId: number,
    @Body(ValidationPipe) updateData: Omit<UpdateCommentDto, 'commentId'>,
    @Query('postId', ParseIntPipe) postId: number,
  ) {
    const updateCommentDto = { ...updateData, commentId };
    return this.commentService.updateComment(updateCommentDto, postId);
  }

  @Delete(':id')
  async deleteComment(@Param('id', ParseIntPipe) commentId: number, @Query('postId', ParseIntPipe) postId: number) {
    return this.commentService.deleteComment(commentId, postId);
  }

  @Public()
  @Get('recent/:authorId')
  async getRecentComments(
    @Param('authorId') authorId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.commentService.getRecentComments(authorId, limit);
  }
}
