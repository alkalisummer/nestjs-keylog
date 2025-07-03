import { Controller, Get, Post, Delete, Query, Body, ValidationPipe, ParseIntPipe } from '@nestjs/common';
import { LikeService } from './like.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { DeleteLikeDto } from './dto/delete-like.dto';
import { LikeQueryDto } from './dto/like-query.dto';

@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Get('count')
  async getLikeCount(@Query('postId', ParseIntPipe) postId: number) {
    const query: LikeQueryDto = { postId };
    return this.likeService.getLikeCount(query);
  }

  @Post()
  async createLike(@Body(ValidationPipe) createLikeDto: CreateLikeDto) {
    return this.likeService.createLike(createLikeDto);
  }

  @Delete()
  async deleteLike(@Body(ValidationPipe) deleteLikeDto: DeleteLikeDto) {
    return this.likeService.deleteLike(deleteLikeDto);
  }
}
