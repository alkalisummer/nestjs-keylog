import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('USER')
export class User {
  @PrimaryColumn({ name: 'user_id', type: 'varchar', length: 50 })
  userId: string;

  @Column({ name: 'user_email', type: 'varchar', length: 100 })
  userEmail: string;

  @Column({ name: 'user_nickname', type: 'varchar', length: 100 })
  userNickname: string;

  @Column({
    name: 'user_thmb_img_url',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  userThmbImgUrl?: string;

  @Column({ name: 'user_password', type: 'varchar', length: 200 })
  userPassword: string;

  @Column({
    name: 'user_blog_name',
    type: 'varchar',
    length: 1000,
    nullable: true,
  })
  userBlogName?: string;

  @Column({ name: 'rgsn_dttm', type: 'char', length: 14 })
  rgsnDttm: string;

  @Column({ name: 'amnt_dttm', type: 'char', length: 14 })
  amntDttm: string;
}
