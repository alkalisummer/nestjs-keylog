import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('VERIFY_CODE')
export class VerifyCode {
  @PrimaryGeneratedColumn({ name: 'verify_code_id' })
  verifyCodeId: number;

  @Column({ name: 'verify_code', type: 'varchar', length: 255 })
  verifyCode: string;

  @Column({ name: 'expiration_time', type: 'varchar', length: 14 })
  expirationTime: string;

  @Column({ name: 'rgsn_dttm', type: 'char', length: 14 })
  rgsnDttm: string;
}
