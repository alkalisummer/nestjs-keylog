import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { PostTag } from '../../post-tag/entities/post-tag.entity';

@Entity('HASHTAG')
export class Hashtag {
  @PrimaryGeneratedColumn({ name: 'hashtag_id' })
  hashtagId: number;

  @Column({ name: 'hashtag_name', type: 'varchar', length: 100 })
  hashtagName: string;

  @OneToMany(() => PostTag, (postTag) => postTag.hashtag)
  postTags: PostTag[];
}
