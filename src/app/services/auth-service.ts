import { api, ApiResponse } from './api-client';
import { prepareSecureData } from './crypto-service';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
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

/** 加密登录请求体 */
export interface EncryptedLoginRequest {
  username: string;
  encryptedData: string;
  nonce: string;
}

/** 加密注册请求体 */
export interface EncryptedRegisterRequest {
  username: string;
  encryptedData: string;
  nonce: string;
}

/** 加密修改密码请求体 */
export interface EncryptedChangePasswordRequest {
  encryptedData: string;
  nonce: string;
}

export const authService = {
  async login(data: LoginRequest): Promise<ApiResponse<LoginResult>> {
    const secureData = await prepareSecureData(data.password);
    return api.post<LoginResult>('/auth/login', {
      username: data.username,
      encryptedData: secureData.encryptedData,
      nonce: secureData.nonce,
    } satisfies EncryptedLoginRequest);
  },

  async register(data: Omit<RegisterRequest, 'confirmPassword'> & { confirmPassword?: string }): Promise<ApiResponse<RegisterResult>> {
    const secureData = await prepareSecureData(data.password, data.confirmPassword!);
    return api.post<RegisterResult>('/auth/register', {
      username: data.username,
      encryptedData: secureData.encryptedData,
      nonce: secureData.nonce,
    } satisfies EncryptedRegisterRequest);
  },

  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<null>> {
    const secureData = await prepareSecureData(data.oldPassword, data.newPassword, data.confirmPassword);
    return api.post<null>('/auth/change-password', {
      encryptedData: secureData.encryptedData,
      nonce: secureData.nonce,
    } satisfies EncryptedChangePasswordRequest);
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
