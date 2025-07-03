import { Injectable } from '@nestjs/common';
import { PostRepository, PostListItem, PostDetail, RecentPost, PopularPost } from './post.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostListQueryDto } from './dto/post-list-query.dto';
import { Post } from './entities/post.entity';

@Injectable()
export class PostService {
  constructor(private readonly postRepository: PostRepository) {}

  async getPostList(query: PostListQueryDto): Promise<PostListItem[]> {
    return this.postRepository.getPostList(query);
  }

  async getPostById(postId: number): Promise<PostDetail | undefined> {
    return this.postRepository.getPostById(postId);
  }

  async createPost(createPostDto: CreatePostDto): Promise<Post> {
    return this.postRepository.createPost(createPostDto);
  }

  async updatePost(updatePostDto: UpdatePostDto): Promise<void> {
    await this.postRepository.updatePost(updatePostDto);
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
}
