/** 后端 API 根路径，优先读取环境变量，回退到本地开发地址 */
const API_BASE = import.meta.env.VITE_API_BASE || '/api/v1'

import { toast } from 'sonner'

interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}

// Token 管理

/** 从 localStorage 读取当前 Access Token */
function getAccessToken(): string | null {
  return localStorage.getItem('access_token')
}

/** 从 localStorage 读取当前 Refresh Token */
function getRefreshToken(): string | null {
  return localStorage.getItem('refresh_token')
}

/** 将 Access Token 与 Refresh Token 写入 localStorage */
function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem('access_token', accessToken)
  localStorage.setItem('refresh_token', refreshToken)
}

/** 清除 localStorage 中的所有 Token（登出/过期时调用） */
function clearTokens(): void {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

// 刷新 Token 防并发标志与请求队列
let isRefreshing = false
let requestsQueue: Array<(token: string) => void> = []

/**
 * 将挂起的请求压入队列
 */
function subscribeTokenRefresh(cb: (token: string) => void) {
  requestsQueue.push(cb)
}

/**
 * 刷新成功后，释放所有挂起的请求
 */
function onRefreshed(token: string) {
  requestsQueue.forEach((cb) => cb(token))
  requestsQueue = []
}

/**
 * 刷新失败后，清空队列
 */
function rejectRefreshed() {
  requestsQueue = []
}

/**
 * 核心 HTTP 请求函数，自动注入 Bearer Token，
 * 并在收到 401 时尝试刷新 Token 后重试一次。
 */
async function request<T = any>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${path}`

  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  }

  const token = getAccessToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // 仅在非 FormData 请求时设置默认 JSON Content-Type
  // FormData 需由浏览器自动设置 multipart/form-data; boundary=...
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  let res = await fetch(url, { ...options, headers })

  // 401 自动刷新
  if (res.status === 401 && getRefreshToken()) {
    // 如果在请求期间，token 已经被其他流程（如重新登录）修改
    // 则不应该使用新的 refresh token 去刷新，也不应该用新 token 重试旧请求
    if (token !== getAccessToken()) {
      throw new Error('认证状态已变更，取消原请求')
    }

    if (path === '/auth/logout') {
      clearTokens()
      throw new Error('认证已过期')
    }

    if (!isRefreshing) {
      isRefreshing = true
      try {
        const refreshToken = getRefreshToken()
        const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        })

        if (refreshRes.ok) {
          const json: ApiResponse<{
            accessToken: string
            refreshToken: string
          }> = await refreshRes.json()
          if (json.code === 200 && json.data) {
            const newToken = json.data.accessToken
            setTokens(newToken, json.data.refreshToken)

            // 刷新成功，释放挂起的请求
            onRefreshed(newToken)

            // 重新发送当前请求
            headers['Authorization'] = `Bearer ${newToken}`
            res = await fetch(url, { ...options, headers })
          } else {
            throw new Error('Refresh failed')
          }
        } else {
          throw new Error('Refresh failed')
        }
      } catch (err) {
        rejectRefreshed()
        if (getAccessToken() === token) {
          clearTokens()
          window.dispatchEvent(new CustomEvent('auth:logout'))
        }
        throw new Error('认证已过期，请重新登录')
      } finally {
        isRefreshing = false
      }
    } else {
      // 正在刷新中，将当前请求挂起，等待刷新完成后重试
      return new Promise<ApiResponse<T>>((resolve, reject) => {
        subscribeTokenRefresh(async (newToken: string) => {
          try {
            headers['Authorization'] = `Bearer ${newToken}`
            const retryRes = await fetch(url, { ...options, headers })

            if (!retryRes.ok) {
              const errorBody = await retryRes.json().catch(() => ({}))
              throw new Error(errorBody.message || `请求失败 (${retryRes.status})`)
            }

            const retryJson = await retryRes.json()
            if (retryJson && typeof retryJson.code === 'number' && retryJson.code !== 200) {
              throw new Error(retryJson.message || `业务异常 (${retryJson.code})`)
            }

            resolve(retryJson)
          } catch (e) {
            reject(e)
          }
        })
      })
    }
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}))
    const errMsg = (errorBody as any).message || `请求失败 (${res.status})`
    toast.error(errMsg)
    throw new Error(errMsg)
  }

  const json = await res.json()

  // 封装前端处理后端统一响应码逻辑，复用全局
  if (json && typeof json.code === 'number' && json.code !== 200) {
    const errMsg = json.message || `业务异常 (${json.code})`
    toast.error(errMsg) // 页面统一提示异常
    throw new Error(errMsg)
  }

  return json
}

/** 便捷 HTTP 方法封装，统一调用核心 request 函数 */
export const api = {
  /** 发起 GET 请求 */
  get<T = any>(path: string) {
    return request<T>(path, { method: 'GET' })
  },
  /** 发起 POST 请求，自动序列化 body 为 JSON */
  post<T = any>(path: string, body?: any) {
    return request<T>(path, { method: 'POST', body: JSON.stringify(body) })
  },
  /** 发起 PUT 请求，自动序列化 body 为 JSON */
  put<T = any>(path: string, body?: any) {
    return request<T>(path, { method: 'PUT', body: JSON.stringify(body) })
  },
  /** 发起 PATCH 请求，自动序列化 body 为 JSON */
  patch<T = any>(path: string, body?: any) {
    return request<T>(path, { method: 'PATCH', body: JSON.stringify(body) })
  },
  /** 发起 DELETE 请求 */
  delete<T = any>(path: string) {
    return request<T>(path, { method: 'DELETE' })
  },
  /** 发起文件上传请求（multipart/form-data），由浏览器自动设置 boundary */
  upload<T = any>(path: string, formData: FormData) {
    const token = getAccessToken()
    return request<T>(path, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })
  },
}

export type { ApiResponse }
export { API_BASE, clearTokens, getAccessToken, setTokens }
