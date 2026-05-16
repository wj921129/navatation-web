import { authService, LoginResult, UserInfo } from '../services/auth-service';
import { setTokens, clearTokens, getAccessToken } from '../services/api-client';

type AuthListener = (state: AuthState) => void;

export interface AuthState {
  isLoggedIn: boolean;
  isLoading: boolean;
  user: UserInfo | null;
}

class AuthStore {
  private state: AuthState = {
    isLoggedIn: !!getAccessToken(),
    isLoading: false,
    user: null,
  };

  private listeners: Set<AuthListener> = new Set();

  getState(): AuthState {
    return { ...this.state };
  }

  subscribe(listener: AuthListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const state = this.getState();
    this.listeners.forEach((fn) => fn(state));
  }

  private setState(partial: Partial<AuthState>): void {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  async login(username: string, password: string): Promise<void> {
    this.setState({ isLoading: true });
    try {
      const res = await authService.login({ username, password });
      if (res.code === 200 && res.data) {
        const data: LoginResult = res.data;
        setTokens(data.accessToken, data.refreshToken);
        this.setState({
          isLoggedIn: true,
          isLoading: false,
          user: data.userInfo,
        });
      }
    } catch (err) {
      this.setState({ isLoading: false });
      throw err;
    }
  }

  async register(username: string, password: string): Promise<void> {
    this.setState({ isLoading: true });
    try {
      const res = await authService.register({
        username,
        password,
        confirmPassword: password,
      });
      if (res.code === 200 && res.data) {
        this.setState({ isLoading: false });
        // 注册成功后自动登录
        await this.login(username, password);
      }
    } catch (err) {
      this.setState({ isLoading: false });
      throw err;
    }
  }

  async fetchUser(): Promise<void> {
    if (!getAccessToken()) return;
    try {
      const res = await authService.getMe();
      if (res.code === 200 && res.data) {
        this.setState({ user: res.data, isLoggedIn: true });
      }
    } catch {
      // Token 无效，静默处理
      this.setState({ isLoggedIn: false, user: null });
    }
  }

  logout(): void {
    authService.logout().catch(() => {});
    clearTokens();
    this.setState({ isLoggedIn: false, user: null, isLoading: false });
  }
}

export const authStore = new AuthStore();
