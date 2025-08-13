import { UserInfo } from '../user.repository';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserInfo;
}
