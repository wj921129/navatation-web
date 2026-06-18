import { type TodoItem, todoService } from '../services/todo-service'

type TodoListener = (state: TodoState) => void

/**
 * TodoState 组件/功能描述
 */
export interface TodoState {
  todos: TodoItem[]
  loading: boolean
}

class TodoStore {
  private state: TodoState = {
    todos: [],
    loading: false,
  }

  private listeners: Set<TodoListener> = new Set()

  /** 加载请求序列号，用于防止并发 loadTodos 导致 loading 状态错乱 */
  private loadSeq = 0

  /** 返回当前状态快照（浅拷贝） */
  getState(): TodoState {
    return { ...this.state }
  }

  /** 订阅状态变更，返回取消订阅函数 */
  subscribe(listener: TodoListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /** 通知所有监听器状态已变更 */
  private notify(): void {
    const state = this.getState()
    this.listeners.forEach((fn) => fn(state))
  }

  /** 合并更新部分状态并触发通知 */
  private setState(partial: Partial<TodoState>): void {
    this.state = { ...this.state, ...partial }
    this.notify()
  }

  /** 从 localStorage 读取游客模式下本地存储的待办列表 */
  private getLocalTodos(): TodoItem[] {
    try {
      const raw = localStorage.getItem('navatation_todos')
      return raw ? JSON.parse(raw) : []
    } catch (err) {
      console.warn('解析本地待办列表出错，返回空列表:', err)
      return []
    }
  }

  /** 将待办列表持久化到 localStorage（游客模式使用） */
  private saveLocalTodos(items: TodoItem[]): void {
    localStorage.setItem('navatation_todos', JSON.stringify(items))
  }

  /**
   * 将游客本地待办事项同步到云端（首次登录且云端为空时触发）。
   * 并行创建后拉取最新列表并更新状态，保留 completed 状态。
   */
  private async syncLocalToCloud(local: TodoItem[]): Promise<void> {
    await Promise.all(local.map((item) => todoService.create(item.content)))
    // 对已完成的本地待办，逐条 toggle 云端对应事项为已完成
    const cloudRes = await todoService.getList()
    if (cloudRes.code === 200) {
      const completedContents = new Set(local.filter((t) => t.completed).map((t) => t.content))
      await Promise.all(
        cloudRes.data
          .filter((t) => completedContents.has(t.content) && !t.completed)
          .map((t) => todoService.toggle(t.todoId)),
      )
    }
    // 同步完成后清除本地缓存，避免下次重复同步
    localStorage.removeItem('navatation_todos')
    const newRes = await todoService.getList()
    this.setState({
      todos: newRes.code === 200 ? newRes.data : [],
      loading: false,
    })
  }

  /**
   * 加载待办事项列表。
   * 已登录时从云端拉取，首次登录且云端为空时自动同步本地数据；
   * 未登录时从 localStorage 读取。
   */
  async loadTodos(isLoggedIn: boolean): Promise<void> {
    const seq = ++this.loadSeq
    this.setState({ loading: true })
    try {
      if (!isLoggedIn) {
        if (seq === this.loadSeq) this.setState({ todos: this.getLocalTodos(), loading: false })
        return
      }

      // 已登录：从云端拉取数据
      const res = await todoService.getList()
      // 如果期间有更新的 loadTodos 调用，丢弃本次结果
      if (seq !== this.loadSeq) return

      // 云端为空时，尝试将本地游客数据同步到云端
      if (res.data.length === 0) {
        const local = this.getLocalTodos()
        if (local.length > 0) {
          await this.syncLocalToCloud(local)
          return
        }
      }

      this.setState({ todos: res.data, loading: false })
    } catch (_err) {
      console.error('加载待办列表失败:', _err)
      if (seq === this.loadSeq) this.setState({ loading: false })
    }
  }

  /** 创建新待办事项，登录状态下同步到云端，否则仅存本地 */
  async createTodo(content: string, isLoggedIn: boolean): Promise<void> {
    try {
      if (isLoggedIn) {
        const res = await todoService.create(content)
        if (res.code === 200) await this.loadTodos(isLoggedIn)
      } else {
        const localId = `TD-local-${crypto.randomUUID()}`
        const newTodo: TodoItem = {
          todoId: localId,
          content,
          completed: false,
          sortOrder: this.state.todos.length,
          createdAt: new Date().toISOString(),
          completedAt: null,
        }
        const updated = [...this.state.todos, newTodo]
        this.setState({ todos: updated })
        this.saveLocalTodos(updated)
      }
    } catch (_err) {
      console.error('创建待办事项失败:', _err)
    }
  }

  /** 切换指定待办事项的完成状态，登录时同步云端 */
  async toggleTodo(todoId: string, isLoggedIn: boolean): Promise<void> {
    try {
      if (isLoggedIn) {
        const res = await todoService.toggle(todoId)
        if (res.code === 200) await this.loadTodos(isLoggedIn)
      } else {
        const updated = this.state.todos.map((t) =>
          t.todoId === todoId
            ? {
                ...t,
                completed: !t.completed,
                completedAt: !t.completed ? new Date().toISOString() : null,
              }
            : t,
        )
        this.setState({ todos: updated })
        this.saveLocalTodos(updated)
      }
    } catch (_err) {
      console.error('切换待办状态失败:', _err)
    }
  }

  /** 编辑指定待办事项的内容，登录时同步云端 */
  async updateTodo(todoId: string, content: string, isLoggedIn: boolean): Promise<void> {
    try {
      if (isLoggedIn) {
        const res = await todoService.update(todoId, content)
        if (res.code === 200) await this.loadTodos(isLoggedIn)
      } else {
        const updated = this.state.todos.map((t) => (t.todoId === todoId ? { ...t, content } : t))
        this.setState({ todos: updated })
        this.saveLocalTodos(updated)
      }
    } catch (_err) {
      console.error('更新待办事项失败:', _err)
    }
  }

  /** 删除指定待办事项，登录时同步云端 */
  async deleteTodo(todoId: string, isLoggedIn: boolean): Promise<void> {
    try {
      if (isLoggedIn) {
        const res = await todoService.delete(todoId)
        if (res.code === 200) await this.loadTodos(isLoggedIn)
      } else {
        const updated = this.state.todos.filter((t) => t.todoId !== todoId)
        this.setState({ todos: updated })
        this.saveLocalTodos(updated)
      }
    } catch (_err) {
      console.error('删除待办事项失败:', _err)
    }
  }

  /** 一键清除所有已完成的待办事项，登录时同步云端 */
  async clearCompleted(isLoggedIn: boolean): Promise<void> {
    try {
      if (isLoggedIn) {
        const res = await todoService.clearCompleted()
        if (res.code === 200) await this.loadTodos(isLoggedIn)
      } else {
        const updated = this.state.todos.filter((t) => !t.completed)
        this.setState({ todos: updated })
        this.saveLocalTodos(updated)
      }
    } catch (_err) {
      console.error('清理已完成待办失败:', _err)
    }
  }
}

/** 全局单例 TodoStore，供所有组件通过发布订阅共享待办状态 */
export const todoStore = new TodoStore()
