const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api/v1';

interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

// Token 管理
function getAccessToken(): string | null {
  return localStorage.getItem('access_token');
}

function getRefreshToken(): string | null {
  return localStorage.getItem('refresh_token');
}

function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
}

function clearTokens(): void {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

// 刷新 Token
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

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

// 核心请求函数
async function request<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  const token = getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res = await fetch(url, { ...options, headers });

  // 401 自动刷新
  if (res.status === 401 && getRefreshToken()) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${getAccessToken()}`;
      res = await fetch(url, { ...options, headers });
    } else {
      clearTokens();
      window.dispatchEvent(new CustomEvent('auth:logout'));
      throw new Error('认证已过期，请重新登录');
    }
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error((errorBody as any).message || `请求失败 (${res.status})`);
  }

  return res.json();
}

// 便捷方法
export const api = {
  get<T = any>(path: string) {
    return request<T>(path, { method: 'GET' });
  },
  post<T = any>(path: string, body?: any) {
    return request<T>(path, { method: 'POST', body: JSON.stringify(body) });
  },
  put<T = any>(path: string, body?: any) {
    return request<T>(path, { method: 'PUT', body: JSON.stringify(body) });
  },
  patch<T = any>(path: string, body?: any) {
    return request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
  },
  delete<T = any>(path: string) {
    return request<T>(path, { method: 'DELETE' });
  },
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
