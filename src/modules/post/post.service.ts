import { Injectable } from '@nestjs/common';
import { PostRepository, PostListItem, PostDetail, RecentPost, PopularPost } from './post.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostListQueryDto } from './dto/post-list-query.dto';
import { Post } from './entities/post.entity';
import { HashtagRepository } from '../hashtag/hashtag.repository';
import { CreateHashtagDto } from '../hashtag/dto/create-hashtag.dto';
import { PostTagRepository } from '../post-tag/post-tag.repository';
import { CreatePostTagDto } from '../post-tag/dto/create-post-tag.dto';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly hashtagRepository: HashtagRepository,
    private readonly postTagRepository: PostTagRepository,
  ) {}

  async getPostList(query: PostListQueryDto): Promise<PostListItem[]> {
    return this.postRepository.getPostList(query);
  }

  async getPostById(postId: number): Promise<PostDetail | undefined> {
    return this.postRepository.getPostById(postId);
  }

  async createPost(createPostDto: CreatePostDto): Promise<Post> {
    const createdPost: Post = await this.postRepository.createPost(createPostDto);
    await this.upsertPostTags(createdPost.postId, createPostDto.hashtagList);
    return createdPost;
  }

  async updatePost(updatePostDto: UpdatePostDto): Promise<void> {
    await this.postRepository.updatePost(updatePostDto);
    await this.upsertPostTags(updatePostDto.postId, updatePostDto.hashtagList);
  }

  async deletePost(postId: number): Promise<void> {
    await this.postRepository.deletePost(postId);
  }

  async deletePostsByUserId(authorId: string): Promise<void> {
    await this.postRepository.deletePostsByUserId(authorId);
  }

  async getRecentPosts(authorId: string, limit?: number): Promise<RecentPost[]> {
    return this.postRepository.getRecentPosts(authorId, limit);
  }

  async getPopularPosts(authorId: string, limit?: number): Promise<PopularPost[]> {
    return this.postRepository.getPopularPosts(authorId, limit);
  }

  async deleteTempPost(postOriginId: number): Promise<void> {
    await this.postRepository.deleteTempPost(postOriginId);
  }

  async getLastTempPost(postId: number): Promise<PostDetail | undefined> {
    return this.postRepository.getLastTempPost(postId);
  }

  private async upsertPostTags(postId: number, hashtagList?: string[]): Promise<void> {
    if (typeof hashtagList === 'undefined') {
      return;
    }

    await this.postTagRepository.deletePostTagsByPostId(postId);

    if (hashtagList.length === 0) {
      return;
    }

    const normalizedNames: string[] = hashtagList
      .map((name: string) => name?.trim())
      .filter((name: string | undefined): name is string => Boolean(name));

    const postTagsToCreate: CreatePostTagDto[] = [];

    for (const hashtagName of normalizedNames) {
      const hashtagId: number = await this.findOrCreateHashtagIdByName(hashtagName);
      postTagsToCreate.push({ postId, hashtagId } as CreatePostTagDto);
    }

    if (postTagsToCreate.length > 0) {
      await this.postTagRepository.createMultiplePostTags(postTagsToCreate);
    }
  }

  private async findOrCreateHashtagIdByName(hashtagName: string): Promise<number> {
    const existing = await this.hashtagRepository.findHashtagByName(hashtagName);
    if (existing) {
      return existing.hashtagId;
    }

    const created = await this.hashtagRepository.createHashtag({ hashtagName } as CreateHashtagDto);
    return created.hashtagId;
  }
}
