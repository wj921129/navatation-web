import { api, ApiResponse } from './api-client';

export interface TodoItem {
  todoId: number;
  content: string;
  completed: boolean;
  sortOrder: number;
  createdAt: string;
  completedAt: string | null;
}

export interface TodoSortItem {
  todoId: number;
  sortOrder: number;
}

export const todoService = {
  getList(status?: string): Promise<ApiResponse<TodoItem[]>> {
    const query = status ? `?status=${status}` : '';
    return api.get(`/todo${query}`);
  },

  create(content: string): Promise<ApiResponse<TodoItem>> {
    return api.post('/todo', { content });
  },

  update(todoId: number, content: string): Promise<ApiResponse<null>> {
    return api.put(`/todo/${todoId}`, { content });
  },

  toggle(todoId: number): Promise<ApiResponse<{ todoId: number; completed: boolean; completedAt: string | null }>> {
    return api.patch(`/todo/${todoId}/toggle`);
  },

  delete(todoId: number): Promise<ApiResponse<null>> {
    return api.delete(`/todo/${todoId}`);
  },

  sort(items: TodoSortItem[]): Promise<ApiResponse<null>> {
    return api.put('/todo/sort', { items });
  },

  clearCompleted(): Promise<ApiResponse<{ deletedCount: number }>> {
    return api.delete('/todo/completed');
  },
};
