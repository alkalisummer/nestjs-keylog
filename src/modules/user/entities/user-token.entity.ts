import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('USER_TOKEN')
export class UserToken {
  @PrimaryGeneratedColumn({ name: 'token_id' })
  tokenId: number;

  @Column({ name: 'token', type: 'varchar', length: 255 })
  token: string;

  @Column({ name: 'user_id', type: 'varchar', length: 50 })
  userId: string;

  @Column({ name: 'expire_time', type: 'varchar', length: 14 })
  expireTime: string;

  @Column({ name: 'rgsn_dttm', type: 'char', length: 14 })
  rgsnDttm: string;
}
