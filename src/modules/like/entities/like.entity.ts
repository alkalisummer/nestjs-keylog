import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('LIKEACT')
export class Like {
  @PrimaryGeneratedColumn({ name: 'likeact_id' })
  likeactId: number;

  @Column({ name: 'user_id', type: 'varchar', length: 50 })
  userId: string;

  @Column({ name: 'post_id', type: 'int' })
  postId: number;

  @Column({ name: 'rgsn_dttm', type: 'varchar', length: 14 })
  rgsnDttm: string;

  @Column({ name: 'amnt_dttm', type: 'varchar', length: 14 })
  amntDttm: string;
}
