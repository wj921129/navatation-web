import { todoService, TodoItem } from '../services/todo-service';

type TodoListener = (state: TodoState) => void;

/**
 * TodoState 组件/功能描述
 */
export interface TodoState {
  todos: TodoItem[];
  loading: boolean;
}

class TodoStore {
  private state: TodoState = {
    todos: [],
    loading: false,
  };

  private listeners: Set<TodoListener> = new Set();

  /** 返回当前状态快照（浅拷贝） */
  getState(): TodoState {
    return { ...this.state };
  }

  /** 订阅状态变更，返回取消订阅函数 */
  subscribe(listener: TodoListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** 通知所有监听器状态已变更 */
  private notify(): void {
    const state = this.getState();
    this.listeners.forEach((fn) => fn(state));
  }

  /** 合并更新部分状态并触发通知 */
  private setState(partial: Partial<TodoState>): void {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  /** 从 localStorage 读取游客模式下本地存储的待办列表 */
  private getLocalTodos(): TodoItem[] {
    try {
      const raw = localStorage.getItem('navatation_todos');
      if (raw) return JSON.parse(raw);
      
      const defaultTodo: TodoItem = {
        todoId: "TD-local-default",
        content: "👋 欢迎使用 Navatation！这是一个本地示例待办。",
        completed: false,
        sortOrder: 0,
        createdAt: new Date().toISOString(),
        completedAt: null,
      };
      this.saveLocalTodos([defaultTodo]);
      return [defaultTodo];
    } catch {
      return [];
    }
  }

  /** 将待办列表持久化到 localStorage（游客模式使用） */
  private saveLocalTodos(items: TodoItem[]): void {
    localStorage.setItem('navatation_todos', JSON.stringify(items));
  }

  /**
   * 将游客本地待办事项同步到云端（首次登录且云端为空时触发）。
   * 逐条创建后拉取最新列表并更新状态。
   */
  private async syncLocalToCloud(local: TodoItem[]): Promise<void> {
    for (const item of local) {
      await todoService.create(item.content);
    }
    // 同步完成后清除本地缓存，避免下次重复同步
    localStorage.removeItem('navatation_todos');
    const newRes = await todoService.getList();
    if (newRes.code === 200) {
      this.setState({ todos: newRes.data, loading: false });
    }
  }

  /**
   * 加载待办事项列表。
   * 已登录时从云端拉取，首次登录且云端为空时自动同步本地数据；
   * 未登录时从 localStorage 读取。
   */
  async loadTodos(isLoggedIn: boolean): Promise<void> {
    this.setState({ loading: true });
    try {
      if (!isLoggedIn) {
        this.setState({ todos: this.getLocalTodos(), loading: false });
        return;
      }

      // 已登录：从云端拉取数据
      const res = await todoService.getList();
      if (res.code !== 200) {
        this.setState({ loading: false });
        return;
      }

      // 云端为空时，尝试将本地游客数据同步到云端
      if (res.data.length === 0) {
        const local = this.getLocalTodos();
        if (local.length > 0) {
          await this.syncLocalToCloud(local);
          return;
        }
      }

      this.setState({ todos: res.data, loading: false });
    } catch (err) {
      console.error('获取待办事项失败', err);
      this.setState({ loading: false });
    }
  }

  /** 创建新待办事项，登录状态下同步到云端，否则仅存本地 */
  async createTodo(content: string, isLoggedIn: boolean): Promise<void> {
    try {
      if (isLoggedIn) {
        const res = await todoService.create(content);
        if (res.code === 200) await this.loadTodos(isLoggedIn);
      } else {
        // 游客本地 ID 使用字符串前缀加上随机值
        const localId = "TD-local-" + Math.floor(Math.random() * 100_000_000);
        const newTodo: TodoItem = {
          todoId: localId,
          content,
          completed: false,
          sortOrder: this.state.todos.length,
          createdAt: new Date().toISOString(),
          completedAt: null,
        };
        const updated = [...this.state.todos, newTodo];
        this.setState({ todos: updated });
        this.saveLocalTodos(updated);
      }
    } catch (err) {
      console.error('创建待办失败', err);
    }
  }

  /** 切换指定待办事项的完成状态，登录时同步云端 */
  async toggleTodo(todoId: string, isLoggedIn: boolean): Promise<void> {
    try {
      if (isLoggedIn) {
        const res = await todoService.toggle(todoId);
        if (res.code === 200) await this.loadTodos(isLoggedIn);
      } else {
        const updated = this.state.todos.map(t =>
          t.todoId === todoId
            ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : null }
            : t,
        );
        this.setState({ todos: updated });
        this.saveLocalTodos(updated);
      }
    } catch (err) {
      console.error('切换待办状态失败', err);
    }
  }

  /** 编辑指定待办事项的内容，登录时同步云端 */
  async updateTodo(todoId: string, content: string, isLoggedIn: boolean): Promise<void> {
    try {
      if (isLoggedIn) {
        const res = await todoService.update(todoId, content);
        if (res.code === 200) await this.loadTodos(isLoggedIn);
      } else {
        const updated = this.state.todos.map(t =>
          t.todoId === todoId ? { ...t, content } : t,
        );
        this.setState({ todos: updated });
        this.saveLocalTodos(updated);
      }
    } catch (err) {
      console.error('编辑待办失败', err);
    }
  }

  /** 删除指定待办事项，登录时同步云端 */
  async deleteTodo(todoId: string, isLoggedIn: boolean): Promise<void> {
    try {
      if (isLoggedIn) {
        const res = await todoService.delete(todoId);
        if (res.code === 200) await this.loadTodos(isLoggedIn);
      } else {
        const updated = this.state.todos.filter(t => t.todoId !== todoId);
        this.setState({ todos: updated });
        this.saveLocalTodos(updated);
      }
    } catch (err) {
      console.error('删除待办失败', err);
    }
  }

  /** 一键清除所有已完成的待办事项，登录时同步云端 */
  async clearCompleted(isLoggedIn: boolean): Promise<void> {
    try {
      if (isLoggedIn) {
        const res = await todoService.clearCompleted();
        if (res.code === 200) await this.loadTodos(isLoggedIn);
      } else {
        const updated = this.state.todos.filter(t => !t.completed);
        this.setState({ todos: updated });
        this.saveLocalTodos(updated);
      }
    } catch (err) {
      console.error('清除已完成待办失败', err);
    }
  }
}

/** 全局单例 TodoStore，供所有组件通过发布订阅共享待办状态 */
export const todoStore = new TodoStore();
