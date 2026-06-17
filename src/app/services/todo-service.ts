import { type ApiResponse, api } from './api-client'

/**
 * TodoItem 组件/功能描述
 */
export interface TodoItem {
  todoId: string
  content: string
  completed: boolean
  sortOrder: number
  createdAt: string
  completedAt: string | null
}

/**
 * TodoSortItem 组件/功能描述
 */
export interface TodoSortItem {
  todoId: string
  sortOrder: number
}

export const todoService = {
  /** 获取待办事项列表，可按状态筛选（不传则获取全部） */
  getList(status?: string): Promise<ApiResponse<TodoItem[]>> {
    const query = status ? `?status=${status}` : ''
    return api.get(`/todo${query}`)
  },

  /** 创建新的待办事项 */
  create(content: string): Promise<ApiResponse<TodoItem>> {
    return api.post('/todo', { content })
  },

  /** 更新指定待办事项的内容文本 */
  update(todoId: string, content: string): Promise<ApiResponse<null>> {
    return api.put(`/todo/${todoId}`, { content })
  },

  /** 切换指定待办事项的完成状态（完成 ↔ 未完成） */
  toggle(todoId: string): Promise<
    ApiResponse<{
      todoId: string
      completed: boolean
      completedAt: string | null
    }>
  > {
    return api.patch(`/todo/${todoId}/toggle`)
  },

  /** 删除指定待办事项 */
  delete(todoId: string): Promise<ApiResponse<null>> {
    return api.delete(`/todo/${todoId}`)
  },

  /** 批量更新待办事项排序，传入 todoId 与目标 sortOrder 列表 */
  sort(items: TodoSortItem[]): Promise<ApiResponse<null>> {
    return api.put('/todo/sort', { items })
  },

  /** 一键清除所有已完成的待办事项，返回删除条数 */
  clearCompleted(): Promise<ApiResponse<{ deletedCount: number }>> {
    return api.delete('/todo/completed')
  },
}
