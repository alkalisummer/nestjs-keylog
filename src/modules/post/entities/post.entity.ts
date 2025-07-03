import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { PostTag } from '../../post-tag/entities/post-tag.entity';

@Entity('POST')
export class Post {
  @PrimaryGeneratedColumn({ name: 'post_id' })
  postId: number;

  @Column({ name: 'post_title', type: 'varchar', length: 200 })
  postTitle: string;

  @Column({ name: 'post_cntn', type: 'varchar', length: 5000 })
  postCntn: string;

  @Column({ name: 'post_html_cntn', type: 'blob' })
  postHtmlCntn: Buffer;

  @Column({
    name: 'post_thmb_img_url',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  postThmbImgUrl?: string;

  @Column({ name: 'rgsr_id', type: 'varchar', length: 50 })
  authorId: string;

  @Column({ name: 'temp_yn', type: 'char', length: 1, default: 'N' })
  tempYn: string;

  @Column({ name: 'post_origin_id', type: 'int', nullable: true })
  postOriginId?: number;

  @Column({ name: 'rgsn_dttm', type: 'char', length: 14 })
  rgsnDttm: string;

  @Column({ name: 'amnt_dttm', type: 'char', length: 14 })
  amntDttm: string;

  @OneToMany(() => PostTag, (postTag) => postTag.post)
  postTags: PostTag[];
}
