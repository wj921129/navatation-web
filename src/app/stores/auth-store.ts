import { clearTokens, getAccessToken, setTokens } from '../services/api-client'
import { authService, type LoginResult, type UserInfo } from '../services/auth-service'

type AuthListener = (state: AuthState) => void

/**
 * AuthState 组件/功能描述
 */
export interface AuthState {
  isLoggedIn: boolean
  isLoading: boolean
  user: UserInfo | null
}

class AuthStore {
  private state: AuthState = {
    isLoggedIn: !!getAccessToken(),
    isLoading: false,
    user: null,
  }

  private listeners: Set<AuthListener> = new Set()

  getState(): AuthState {
    return { ...this.state }
  }

  subscribe(listener: AuthListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify(): void {
    const state = this.getState()
    this.listeners.forEach((fn) => fn(state))
  }

  private setState(partial: Partial<AuthState>): void {
    this.state = { ...this.state, ...partial }
    this.notify()
  }

  async login(username: string, password: string): Promise<void> {
    this.setState({ isLoading: true })
    try {
      const res = await authService.login({ username, password })
      if (res.code === 200 && res.data) {
        const data: LoginResult = res.data
        setTokens(data.accessToken, data.refreshToken)
        this.setState({
          isLoggedIn: true,
          isLoading: false,
          user: data.userInfo,
        })
      } else {
        this.setState({ isLoading: false })
        throw new Error(res.message || '用户名或密码错误')
      }
    } catch (err) {
      this.setState({ isLoading: false })
      throw err
    }
  }

  async register(username: string, password: string): Promise<void> {
    this.setState({ isLoading: true })
    try {
      const res = await authService.register({
        username,
        password,
        confirmPassword: password,
      })
      if (res.code === 200 && res.data) {
        this.setState({ isLoading: false })
        // 注册成功后自动登录
        await this.login(username, password)
      } else {
        this.setState({ isLoading: false })
        throw new Error(res.message || '注册失败')
      }
    } catch (err) {
      this.setState({ isLoading: false })
      throw err
    }
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    this.setState({ isLoading: true })
    try {
      const res = await authService.changePassword({
        oldPassword,
        newPassword,
        confirmPassword: newPassword,
      })
      if (res.code === 200) {
        this.setState({ isLoading: false })
      } else {
        this.setState({ isLoading: false })
        throw new Error(res.message || '修改密码失败')
      }
    } catch (err) {
      this.setState({ isLoading: false })
      throw err
    }
  }

  async fetchUser(): Promise<void> {
    if (!getAccessToken()) return
    try {
      const res = await authService.getMe()
      if (res.code === 200 && res.data) {
        this.setState({ user: res.data, isLoggedIn: true })
      }
    } catch {
      // 不清除登录状态，避免与登录流程产生竞态条件
      // api-client 的 401 自动刷新机制会负责处理无效 Token 的清除
    }
  }

  logout(): void {
    authService.logout().catch(() => {})
    clearTokens()
    this.setState({ isLoggedIn: false, user: null, isLoading: false })
  }
}

export const authStore = new AuthStore()
