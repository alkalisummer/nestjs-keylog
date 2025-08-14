import { UserInfo } from '../user.repository';

export interface LoginResponse {
  accessToken: string;
  accessTokenExpireDate: number;
  refreshToken: string;
  user: UserInfo;
}
