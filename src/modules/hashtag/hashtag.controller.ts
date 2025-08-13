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
import { Public } from '../../core/auth/public.decorator';

@Controller('hashtag')
export class HashtagController {
  constructor(private readonly hashtagService: HashtagService) {}

  // GET /hashtag - 모든 해시태그 조회
  @Public()
  @Get()
  async getAllHashtags() {
    return this.hashtagService.getAllHashtags();
  }

  // GET /hashtag/search - 해시태그 검색 (포스트별/사용자별)
  @Public()
  @Get('search')
  async getHashtagsByPost(@Query(new ValidationPipe({ transform: true })) query: HashtagQueryDto) {
    return this.hashtagService.getHashtagsByPost(query);
  }

  // GET /hashtag/search-name/:searchTerm - 해시태그 이름으로 검색
  @Public()
  @Get('search-name/:searchTerm')
  async searchHashtagsByName(@Param('searchTerm') searchTerm: string) {
    return this.hashtagService.searchHashtagsByName(searchTerm);
  }

  // GET /hashtag/info/:userId - 사용자별 해시태그 정보 조회
  @Public()
  @Get('info/:userId')
  async getHashtags(@Param('userId') userId: string) {
    return this.hashtagService.getHashtags(userId);
  }

  // GET /hashtag/check/:hashtagName - 해시태그 존재 여부 확인
  @Public()
  @Get('check/:hashtagName')
  async checkHashtag(@Param('hashtagName') hashtagName: string) {
    const hashtag = await this.hashtagService.findHashtagByName(hashtagName);
    return {
      exists: !!hashtag,
      hashtag: hashtag,
    };
  }

  // GET /hashtag/:id - ID로 해시태그 조회
  @Public()
  @Get(':id')
  async getHashtagById(@Param('id', ParseIntPipe) hashtagId: number) {
    return this.hashtagService.getHashtagById(hashtagId);
  }

  // POST /hashtag - 새 해시태그 생성
  @Post()
  async createHashtag(@Body(ValidationPipe) createHashtagDto: CreateHashtagDto) {
    return this.hashtagService.createHashtag(createHashtagDto);
  }

  // POST /hashtag/find-or-create - 해시태그 찾기 또는 생성
  @Post('find-or-create')
  async findOrCreateHashtag(@Body('hashtagName') hashtagName: string) {
    return this.hashtagService.findOrCreateHashtag(hashtagName);
  }

  // POST /hashtag/batch/find-or-create - 여러 해시태그 찾기 또는 생성
  @Post('batch/find-or-create')
  async findOrCreateMultipleHashtags(@Body('hashtagNames') hashtagNames: string[]) {
    return this.hashtagService.findOrCreateMultipleHashtags(hashtagNames);
  }

  // PUT /hashtag/:id - 해시태그 업데이트
  @Put(':id')
  async updateHashtag(@Param('id', ParseIntPipe) hashtagId: number, @Body('hashtagName') hashtagName: string) {
    return this.hashtagService.updateHashtag(hashtagId, hashtagName);
  }

  // DELETE /hashtag/:id - 해시태그 삭제
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteHashtag(@Param('id', ParseIntPipe) hashtagId: number) {
    await this.hashtagService.deleteHashtag(hashtagId);
    return { message: 'Hashtag deleted successfully' };
  }
}
