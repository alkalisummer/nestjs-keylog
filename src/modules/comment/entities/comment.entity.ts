import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('COMMENT')
export class Comment {
  @PrimaryGeneratedColumn({ name: 'comment_id' })
  commentId: number;

  @Column({ name: 'post_id', type: 'int' })
  postId: number;

  @Column({ name: 'comment_depth', type: 'int' })
  commentDepth: number;

  @Column({ name: 'comment_origin_id', type: 'int', nullable: true })
  commentOriginId?: number;

  @Column({ name: 'comment_cntn', type: 'varchar', length: 300 })
  commentCntn: string;

  @Column({ name: 'rgsr_id', type: 'varchar', length: 50 })
  rgsrId: string;

  @Column({ name: 'rgsn_dttm', type: 'varchar', length: 14 })
  rgsnDttm: string;

  @Column({ name: 'amnt_dttm', type: 'varchar', length: 14 })
  amntDttm: string;
}
