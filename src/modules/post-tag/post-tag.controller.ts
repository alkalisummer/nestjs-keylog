import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PostTagService } from './post-tag.service';
import { CreatePostTagDto } from './dto/create-post-tag.dto';
import { DeletePostTagDto } from './dto/delete-post-tag.dto';
import { PostTagQueryDto } from './dto/post-tag-query.dto';

@Controller('postTag')
export class PostTagController {
  constructor(private readonly postTagService: PostTagService) {}

  // GET /postTag - 모든 포스트-태그 관계 조회
  @Get()
  async getAllPostTags() {
    return this.postTagService.getAllPostTags();
  }

  // GET /postTag/search - 조건에 따른 포스트-태그 검색
  @Get('search')
  async getPostTags(@Query(new ValidationPipe({ transform: true })) query: PostTagQueryDto) {
    return this.postTagService.getPostTags(query);
  }

  // GET /postTag/posts/:postId - 포스트별 해시태그 조회
  @Get('posts/:postId')
  async getPostTagsByPostId(@Param('postId', ParseIntPipe) postId: number) {
    return this.postTagService.getPostTagsByPostId(postId);
  }

  // GET /postTag/hashtags/:hashtagId - 해시태그별 포스트 조회
  @Get('hashtags/:hashtagId')
  async getPostTagsByHashtagId(@Param('hashtagId', ParseIntPipe) hashtagId: number) {
    return this.postTagService.getPostTagsByHashtagId(hashtagId);
  }

  // GET /postTag/users/:userId - 사용자별 포스트-태그 조회
  @Get('users/:userId')
  async getPostTagsByUserId(@Param('userId') userId: string) {
    return this.postTagService.getPostTagsByUserId(userId);
  }

  // GET /postTag/counts - 포스트별 해시태그 개수
  @Get('counts')
  async getHashtagCountByPost() {
    return this.postTagService.getHashtagCountByPost();
  }

  // GET /postTag/exists/:postId/:hashtagId - 관계 존재 여부 확인
  @Get('exists/:postId/:hashtagId')
  async existsPostTag(
    @Param('postId', ParseIntPipe) postId: number,
    @Param('hashtagId', ParseIntPipe) hashtagId: number,
  ) {
    const exists = await this.postTagService.existsPostTag(postId, hashtagId);
    return { exists };
  }

  // POST /postTag - 포스트-태그 관계 생성
  @Post()
  async createPostTag(@Body(ValidationPipe) createPostTagDto: CreatePostTagDto) {
    return this.postTagService.createPostTag(createPostTagDto);
  }

  // POST /postTag/posts/:postId/attach - 포스트에 여러 해시태그 연결
  @Post('posts/:postId/attach')
  async addHashtagsToPost(@Param('postId', ParseIntPipe) postId: number, @Body('hashtagIds') hashtagIds: number[]) {
    return this.postTagService.addHashtagsToPost(postId, hashtagIds);
  }

  // POST /postTag/posts/:postId/update - 포스트의 해시태그 업데이트
  @Post('posts/:postId/update')
  async updatePostHashtags(@Param('postId', ParseIntPipe) postId: number, @Body('hashtagIds') hashtagIds: number[]) {
    return this.postTagService.updatePostHashtags(postId, hashtagIds);
  }

  // DELETE /postTag - 포스트-태그 관계 삭제
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePostTag(
    @Query('postId', ParseIntPipe) postId: number,
    @Query('hashtagId', ParseIntPipe) hashtagId: number,
  ) {
    const deletePostTagDto: DeletePostTagDto = { postId, hashtagId };
    await this.postTagService.deletePostTag(deletePostTagDto);
    return { message: 'Post-tag relationship deleted successfully' };
  }

  // DELETE /postTag/posts/:postId - 포스트의 모든 해시태그 연결 삭제
  @Delete('posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePostTagsByPostId(@Param('postId', ParseIntPipe) postId: number) {
    await this.postTagService.deletePostTagsByPostId(postId);
    return { message: 'All hashtag relationships for post deleted successfully' };
  }

  // DELETE /postTag/hashtags/:hashtagId - 해시태그의 모든 포스트 연결 삭제
  @Delete('hashtags/:hashtagId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePostTagsByHashtagId(@Param('hashtagId', ParseIntPipe) hashtagId: number) {
    await this.postTagService.deletePostTagsByHashtagId(hashtagId);
    return { message: 'All post relationships for hashtag deleted successfully' };
  }
}
