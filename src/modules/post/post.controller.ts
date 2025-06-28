import { Controller, Get, Post, Put, Delete, Param, Body, Query, ParseIntPipe, ValidationPipe } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostListQueryDto } from './dto/post-list-query.dto';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  async getPostList(@Query(new ValidationPipe({ transform: true })) query: PostListQueryDto) {
    return this.postService.getPostList(query);
  }

  @Get(':id')
  async getPostById(@Param('id', ParseIntPipe) postId: number) {
    return this.postService.getPostById(postId);
  }

  @Post()
  async createPost(@Body(ValidationPipe) createPostDto: CreatePostDto) {
    return this.postService.createPost(createPostDto);
  }

  @Put(':id')
  async updatePost(
    @Param('id', ParseIntPipe) postId: number,
    @Body(ValidationPipe) updatePostDto: Omit<UpdatePostDto, 'postId'>,
  ) {
    return this.postService.updatePost({ ...updatePostDto, postId });
  }

  @Delete(':id')
  async deletePost(@Param('id', ParseIntPipe) postId: number) {
    await this.postService.deletePost(postId);
    return { message: 'Post deleted successfully' };
  }

  @Delete('user/:rgsrId')
  async deletePostsByUserId(@Param('rgsrId') rgsrId: string) {
    await this.postService.deletePostsByUserId(rgsrId);
    return { message: 'All posts deleted for user' };
  }

  @Get('recent/:rgsrId')
  async getRecentPosts(
    @Param('rgsrId') rgsrId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.postService.getRecentPosts(rgsrId, limit);
  }

  @Get('popular/:rgsrId')
  async getPopularPosts(
    @Param('rgsrId') rgsrId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.postService.getPopularPosts(rgsrId, limit);
  }

  @Delete('temp/:postOriginId')
  async deleteTempPost(@Param('postOriginId', ParseIntPipe) postOriginId: number) {
    await this.postService.deleteTempPost(postOriginId);
    return { message: 'Temp post deleted successfully' };
  }

  @Get('temp/last/:postId')
  async getLastTempPost(@Param('postId', ParseIntPipe) postId: number) {
    return this.postService.getLastTempPost(postId);
  }
}
