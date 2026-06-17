import { type ApiResponse, api } from './api-client'
import type { HomeShortcut, NavCategory, NavShortcut } from './nav-service'
import type { UserSettings } from './settings-service'
import type { TodoItem } from './todo-service'
import type { WidgetItemDTO } from './widget-service'

export const publicService = {
  getGuestSettings(): Promise<ApiResponse<UserSettings>> {
    return api.get('/public/guest-settings')
  },
  getGuestWidgets(): Promise<ApiResponse<WidgetItemDTO[]>> {
    return api.get('/public/guest-widgets')
  },
  getGuestCategories(): Promise<ApiResponse<NavCategory[]>> {
    return api.get('/public/guest-categories')
  },
  getGuestShortcuts(): Promise<ApiResponse<NavShortcut[]>> {
    return api.get('/public/guest-shortcuts')
  },
  getGuestTodos(): Promise<ApiResponse<TodoItem[]>> {
    return api.get('/public/guest-todos')
  },
  getGuestHomeShortcuts(): Promise<ApiResponse<HomeShortcut[]>> {
    return api.get('/public/guest-home-shortcuts')
  },
}
