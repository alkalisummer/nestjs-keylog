import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { HashtagService } from './hashtag.service';
import { CreateHashtagDto } from './dto/create-hashtag.dto';
import { HashtagQueryDto } from './dto/hashtag-query.dto';

@Controller('hashtags')
export class HashtagController {
  constructor(private readonly hashtagService: HashtagService) {}

  // GET /hashtags - 모든 해시태그 조회
  @Get()
  async getAllHashtags() {
    return this.hashtagService.getAllHashtags();
  }

  // GET /hashtags/search - 해시태그 검색 (포스트별/사용자별)
  @Get('search')
  async getHashtagsByPost(@Query(new ValidationPipe({ transform: true })) query: HashtagQueryDto) {
    return this.hashtagService.getHashtagsByPost(query);
  }

  // GET /hashtags/search-name/:searchTerm - 해시태그 이름으로 검색
  @Get('search-name/:searchTerm')
  async searchHashtagsByName(@Param('searchTerm') searchTerm: string) {
    return this.hashtagService.searchHashtagsByName(searchTerm);
  }

  // GET /hashtags/counts/:userId - 사용자별 해시태그 사용 횟수
  @Get('counts/:userId')
  async getHashtagCounts(@Param('userId') userId: string) {
    return this.hashtagService.getHashtagCounts(userId);
  }

  // GET /hashtags/check/:hashtagName - 해시태그 존재 여부 확인
  @Get('check/:hashtagName')
  async checkHashtag(@Param('hashtagName') hashtagName: string) {
    const hashtag = await this.hashtagService.findHashtagByName(hashtagName);
    return {
      exists: !!hashtag,
      hashtag: hashtag,
    };
  }

  // GET /hashtags/:id - ID로 해시태그 조회
  @Get(':id')
  async getHashtagById(@Param('id', ParseIntPipe) hashtagId: number) {
    return this.hashtagService.getHashtagById(hashtagId);
  }

  // POST /hashtags - 새 해시태그 생성
  @Post()
  async createHashtag(@Body(ValidationPipe) createHashtagDto: CreateHashtagDto) {
    return this.hashtagService.createHashtag(createHashtagDto);
  }

  // POST /hashtags/find-or-create - 해시태그 찾기 또는 생성
  @Post('find-or-create')
  async findOrCreateHashtag(@Body('hashtagName') hashtagName: string) {
    return this.hashtagService.findOrCreateHashtag(hashtagName);
  }

  // POST /hashtags/batch/find-or-create - 여러 해시태그 찾기 또는 생성
  @Post('batch/find-or-create')
  async findOrCreateMultipleHashtags(@Body('hashtagNames') hashtagNames: string[]) {
    return this.hashtagService.findOrCreateMultipleHashtags(hashtagNames);
  }

  // PUT /hashtags/:id - 해시태그 업데이트
  @Put(':id')
  async updateHashtag(@Param('id', ParseIntPipe) hashtagId: number, @Body('hashtagName') hashtagName: string) {
    return this.hashtagService.updateHashtag(hashtagId, hashtagName);
  }

  // DELETE /hashtags/:id - 해시태그 삭제
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteHashtag(@Param('id', ParseIntPipe) hashtagId: number) {
    await this.hashtagService.deleteHashtag(hashtagId);
    return { message: 'Hashtag deleted successfully' };
  }

  // Admin/Test endpoint - smoke test
  @Get('admin/test')
  adminTest() {
    return {
      message: 'Hashtag module is working',
      timestamp: new Date().toISOString(),
      module: 'hashtag',
    };
  }
}
