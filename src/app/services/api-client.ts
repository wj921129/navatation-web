/** 后端 API 根路径，优先读取环境变量，回退到本地开发地址 */
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api/v1';

interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

// Token 管理

/** 从 localStorage 读取当前 Access Token */
function getAccessToken(): string | null {
  return localStorage.getItem('access_token');
}

/** 从 localStorage 读取当前 Refresh Token */
function getRefreshToken(): string | null {
  return localStorage.getItem('refresh_token');
}

/** 将 Access Token 与 Refresh Token 写入 localStorage */
function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
}

/** 清除 localStorage 中的所有 Token（登出/过期时调用） */
function clearTokens(): void {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

// 刷新 Token 防并发标志：保证同一时刻只有一次 refresh 请求在途
/** 是否正在执行 Token 刷新，防止并发重复刷新 */
let isRefreshing = false;
/** 当前进行中的刷新 Promise，供并发请求复用结果 */
let refreshPromise: Promise<boolean> | null = null;

/**
 * 尝试使用 Refresh Token 刷新 Access Token。
 * 并发调用时共享同一 Promise，避免重复请求。
 */
async function tryRefreshToken(): Promise<boolean> {
  if (isRefreshing && refreshPromise) return refreshPromise;

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) return false;

      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) return false;

      const json: ApiResponse<{ accessToken: string; refreshToken: string }> = await res.json();
      if (json.code === 200 && json.data) {
        setTokens(json.data.accessToken, json.data.refreshToken);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * 核心 HTTP 请求函数，自动注入 Bearer Token，
 * 并在收到 401 时尝试刷新 Token 后重试一次。
 */
async function request<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${path}`;

  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  const token = getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // 仅在非 FormData 请求时设置默认 JSON Content-Type
  // FormData 需由浏览器自动设置 multipart/form-data; boundary=...
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  let res = await fetch(url, { ...options, headers });

  // 401 自动刷新
  if (res.status === 401 && getRefreshToken()) {
    // 如果在请求期间，token 已经被其他流程（如重新登录）修改
    // 则不应该使用新的 refresh token 去刷新，也不应该用新 token 重试旧请求
    if (token !== getAccessToken()) {
      throw new Error('认证状态已变更，取消原请求');
    }

    // 登出请求不需要在 token 失效时尝试刷新，防止误用新 token
    if (path === '/auth/logout') {
      clearTokens();
      throw new Error('认证已过期');
    }

    const refreshed = await tryRefreshToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${getAccessToken()}`;
      res = await fetch(url, { ...options, headers });
    } else {
      // 清除前检查 Token 是否已被其他流程（如登录）更新
      // 避免竞态条件下误删新写入的 Token
      if (getAccessToken() === token) {
        clearTokens();
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
      throw new Error('认证已过期，请重新登录');
    }
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error((errorBody as any).message || `请求失败 (${res.status})`);
  }

  return res.json();
}

/** 便捷 HTTP 方法封装，统一调用核心 request 函数 */
export const api = {
  /** 发起 GET 请求 */
  get<T = any>(path: string) {
    return request<T>(path, { method: 'GET' });
  },
  /** 发起 POST 请求，自动序列化 body 为 JSON */
  post<T = any>(path: string, body?: any) {
    return request<T>(path, { method: 'POST', body: JSON.stringify(body) });
  },
  /** 发起 PUT 请求，自动序列化 body 为 JSON */
  put<T = any>(path: string, body?: any) {
    return request<T>(path, { method: 'PUT', body: JSON.stringify(body) });
  },
  /** 发起 PATCH 请求，自动序列化 body 为 JSON */
  patch<T = any>(path: string, body?: any) {
    return request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
  },
  /** 发起 DELETE 请求 */
  delete<T = any>(path: string) {
    return request<T>(path, { method: 'DELETE' });
  },
  /** 发起文件上传请求（multipart/form-data），由浏览器自动设置 boundary */
  upload<T = any>(path: string, formData: FormData) {
    const token = getAccessToken();
    return request<T>(path, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
  },
};

export { getAccessToken, setTokens, clearTokens, API_BASE };
export type { ApiResponse };
