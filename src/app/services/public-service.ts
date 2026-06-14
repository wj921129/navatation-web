import { api, ApiResponse } from './api-client';
import { UserSettings } from './settings-service';
import { WidgetItemDTO } from './widget-service';
import { NavCategory, NavShortcut } from './nav-service';
import { TodoItem } from './todo-service';



export const publicService = {
  getGuestSettings(): Promise<ApiResponse<UserSettings>> {
    return api.get('/public/guest-settings');
  },
  getGuestWidgets(): Promise<ApiResponse<WidgetItemDTO[]>> {
    return api.get('/public/guest-widgets');
  },
  getGuestCategories(): Promise<ApiResponse<NavCategory[]>> {
    return api.get('/public/guest-categories');
  },
  getGuestShortcuts(): Promise<ApiResponse<NavShortcut[]>> {
    return api.get('/public/guest-shortcuts');
  },
  getGuestTodos(): Promise<ApiResponse<TodoItem[]>> {
    return api.get('/public/guest-todos');
  },
};
