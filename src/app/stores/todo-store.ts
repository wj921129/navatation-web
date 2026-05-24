import { todoService, TodoItem } from '../services/todo-service';

type TodoListener = (state: TodoState) => void;

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

  getState(): TodoState {
    return { ...this.state };
  }

  subscribe(listener: TodoListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const state = this.getState();
    this.listeners.forEach((fn) => fn(state));
  }

  private setState(partial: Partial<TodoState>): void {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  private getLocalTodos(): TodoItem[] {
    try {
      const raw = localStorage.getItem('navatation_todos');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveLocalTodos(items: TodoItem[]) {
    localStorage.setItem('navatation_todos', JSON.stringify(items));
  }

  async loadTodos(isLoggedIn: boolean): Promise<void> {
    this.setState({ loading: true });
    try {
      if (isLoggedIn) {
        const res = await todoService.getList();
        if (res.code === 200) {
          if (res.data.length === 0) {
            const local = this.getLocalTodos();
            if (local.length > 0) {
              for (const item of local) {
                await todoService.create(item.content);
              }
              localStorage.removeItem('navatation_todos');
              const newRes = await todoService.getList();
              if (newRes.code === 200) {
                this.setState({ todos: newRes.data, loading: false });
                return;
              }
            }
          }
          this.setState({ todos: res.data, loading: false });
        }
      } else {
        this.setState({ todos: this.getLocalTodos(), loading: false });
      }
    } catch (err) {
      console.error('获取待办事项失败', err);
      this.setState({ loading: false });
    }
  }

  async createTodo(content: string, isLoggedIn: boolean): Promise<void> {
    try {
      if (isLoggedIn) {
        const res = await todoService.create(content);
        if (res.code === 200) await this.loadTodos(isLoggedIn);
      } else {
        const newTodo: TodoItem = {
          todoId: -Math.floor(Math.random() * 100000000) - 1,
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

  async toggleTodo(todoId: number, isLoggedIn: boolean): Promise<void> {
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

  async updateTodo(todoId: number, content: string, isLoggedIn: boolean): Promise<void> {
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

  async deleteTodo(todoId: number, isLoggedIn: boolean): Promise<void> {
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

export const todoStore = new TodoStore();
