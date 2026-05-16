import { api, ApiResponse } from './api-client';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  confirmPassword: string;
}

export interface UserInfo {
  userId: number;
  username: string;
  avatar: string | null;
  createdAt: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userInfo: UserInfo;
}

export interface RegisterResult {
  userId: number;
  username: string;
}

export const authService = {
  login(data: LoginRequest): Promise<ApiResponse<LoginResult>> {
    return api.post('/auth/login', data);
  },

  register(data: RegisterRequest): Promise<ApiResponse<RegisterResult>> {
    return api.post('/auth/register', data);
  },

  refresh(refreshToken: string): Promise<ApiResponse<{ accessToken: string; refreshToken: string; tokenType: string; expiresIn: number }>> {
    return api.post('/auth/refresh', { refreshToken });
  },

  logout(): Promise<ApiResponse<null>> {
    return api.post('/auth/logout');
  },

  getMe(): Promise<ApiResponse<UserInfo>> {
    return api.get('/auth/me');
  },
};
