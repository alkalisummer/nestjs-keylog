import { Controller, Get, Post, Delete, Query, Body, ValidationPipe } from '@nestjs/common';
import { LikeService } from './like.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { DeleteLikeDto } from './dto/delete-like.dto';
import { LikeQueryDto } from './dto/like-query.dto';
import { Public } from '../../core/auth/public.decorator';

@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Public()
  @Get('count')
  async getLikeCount(@Query('postId') postId: string) {
    const parsedPostId = parseInt(postId);
    const query: LikeQueryDto = { postId: parsedPostId };
    return this.likeService.getLikeCount(query);
  }

  @Post()
  async createLike(@Body(ValidationPipe) createLikeDto: CreateLikeDto) {
    return this.likeService.createLike(createLikeDto);
  }

  @Delete()
  async deleteLike(@Query('postId') postId: string, @Query('userId') userId: string) {
    const parsedPostId = parseInt(postId);
    const deleteLikeDto: DeleteLikeDto = { userId, postId: parsedPostId };
    return this.likeService.deleteLike(deleteLikeDto);
  }
}
