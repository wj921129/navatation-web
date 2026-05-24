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
  /** 使用 RSA 加密密码后执行用户登录，返回双 Token 及用户信息 */
  async login(data: LoginRequest): Promise<ApiResponse<LoginResult>> {
    const secureData = await prepareSecureData(data.password);
    return api.post<LoginResult>('/auth/login', {
      username: data.username,
      encryptedData: secureData.encryptedData,
      nonce: secureData.nonce,
    } satisfies EncryptedLoginRequest);
  },

  /** 使用 RSA 加密密码后执行用户注册，返回新建用户基本信息 */
  async register(data: Omit<RegisterRequest, 'confirmPassword'> & { confirmPassword?: string }): Promise<ApiResponse<RegisterResult>> {
    const secureData = await prepareSecureData(data.password, data.confirmPassword!);
    return api.post<RegisterResult>('/auth/register', {
      username: data.username,
      encryptedData: secureData.encryptedData,
      nonce: secureData.nonce,
    } satisfies EncryptedRegisterRequest);
  },

  /** 使用 RSA 加密新旧密码后执行密码修改 */
  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<null>> {
    const secureData = await prepareSecureData(data.oldPassword, data.newPassword, data.confirmPassword);
    return api.post<null>('/auth/change-password', {
      encryptedData: secureData.encryptedData,
      nonce: secureData.nonce,
    } satisfies EncryptedChangePasswordRequest);
  },

  /** 使用 Refresh Token 换取新的 Access Token */
  refresh(refreshToken: string): Promise<ApiResponse<{ accessToken: string; refreshToken: string; tokenType: string; expiresIn: number }>> {
    return api.post('/auth/refresh', { refreshToken });
  },

  /** 执行登出，服务端使当前 Token 失效 */
  logout(): Promise<ApiResponse<null>> {
    return api.post('/auth/logout');
  },

  /** 获取当前已登录用户的基本信息 */
  getMe(): Promise<ApiResponse<UserInfo>> {
    return api.get('/auth/me');
  },
};
