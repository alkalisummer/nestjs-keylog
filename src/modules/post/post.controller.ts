import { Controller, Get, Post, Put, Delete, Param, Body, Query, ParseIntPipe, ValidationPipe } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostListQueryDto } from './dto/post-list-query.dto';
import { Public } from '../../core/auth/public.decorator';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Public()
  @Get()
  async getPostList(@Query(new ValidationPipe({ transform: true })) query: PostListQueryDto) {
    return this.postService.getPostList(query);
  }

  @Public()
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
  async deletePost(@Param('id') postId: number) {
    console.log('delete Post');
    await this.postService.deletePost(postId);
    return { message: 'Post deleted successfully' };
  }

  @Delete('user/:authorId')
  async deletePostsByUserId(@Param('authorId') authorId: string) {
    await this.postService.deletePostsByUserId(authorId);
    return { message: 'All posts deleted for user' };
  }

  @Public()
  @Get('recent/:authorId')
  async getRecentPosts(
    @Param('authorId') authorId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.postService.getRecentPosts(authorId, limit);
  }

  @Public()
  @Get('popular/:authorId')
  async getPopularPosts(
    @Param('authorId') authorId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.postService.getPopularPosts(authorId, limit);
  }

  @Delete('temp/:postOriginId')
  async deleteTempPost(@Param('postOriginId', ParseIntPipe) postOriginId: number) {
    await this.postService.deleteTempPost(postOriginId);
    return { message: 'Temp post deleted successfully' };
  }

  @Public()
  @Get('temp/last/:postId')
  async getLastTempPost(@Param('postId', ParseIntPipe) postId: number) {
    return this.postService.getLastTempPost(postId);
  }
}
