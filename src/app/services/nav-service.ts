import { api, ApiResponse } from './api-client';

// ---- 分类 ----
export interface NavCategory {
  categoryId: number;
  name: string;
  sortOrder: number;
  shortcutCount: number;
}

export interface CreateCategoryRequest {
  name: string;
  sortOrder: number;
}

// ---- 快捷方式 ----
export type IconType = 'BUILTIN' | 'FAVICON' | 'CUSTOM_URL' | 'CUSTOM_UPLOAD';

export interface NavShortcut {
  shortcutId: number;
  categoryId: number;
  name: string;
  url: string;
  iconType: IconType;
  iconValue: string | null;
  iconColor: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface CreateShortcutItem {
  name: string;
  url: string;
  iconType: IconType;
  iconValue?: string;
  iconColor?: string;
}

export interface BatchCreateRequest {
  categoryId: number;
  shortcuts: CreateShortcutItem[];
}

export interface UpdateShortcutRequest {
  name: string;
  url: string;
  iconType?: IconType;
  iconValue?: string;
  iconColor?: string;
}

export interface SortItem {
  shortcutId: number;
  sortOrder: number;
}

// ---- 推荐分类 ----
export interface RecommendSite {
  name: string;
  url: string;
  iconType: IconType;
  iconValue: string;
  iconColor: string;
}

export interface RecommendCategory {
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  sites: RecommendSite[];
}

// ---- Favicon ----
export interface FaviconResult {
  faviconUrl: string;
  sourceUrl: string;
}

export const navService = {
  // 分类
  getCategories(): Promise<ApiResponse<NavCategory[]>> {
    return api.get('/nav/categories');
  },
  createCategory(data: CreateCategoryRequest): Promise<ApiResponse<NavCategory>> {
    return api.post('/nav/categories', data);
  },
  updateCategory(categoryId: number, data: Partial<CreateCategoryRequest>): Promise<ApiResponse<null>> {
    return api.put(`/nav/categories/${categoryId}`, data);
  },
  deleteCategory(categoryId: number): Promise<ApiResponse<null>> {
    return api.delete(`/nav/categories/${categoryId}`);
  },

  // 快捷方式
  getShortcuts(categoryId?: number): Promise<ApiResponse<NavShortcut[]>> {
    const query = categoryId ? `?categoryId=${categoryId}` : '';
    return api.get(`/nav/shortcuts${query}`);
  },
  batchCreateShortcuts(data: BatchCreateRequest): Promise<ApiResponse<{ shortcutId: number; name: string }[]>> {
    return api.post('/nav/shortcuts/batch', data);
  },
  updateShortcut(shortcutId: number, data: UpdateShortcutRequest): Promise<ApiResponse<NavShortcut>> {
    return api.put(`/nav/shortcuts/${shortcutId}`, data);
  },
  deleteShortcut(shortcutId: number): Promise<ApiResponse<null>> {
    return api.delete(`/nav/shortcuts/${shortcutId}`);
  },
  sortShortcuts(items: SortItem[]): Promise<ApiResponse<null>> {
    return api.put('/nav/shortcuts/sort', { items });
  },

  // Favicon
  fetchFavicon(url: string): Promise<ApiResponse<FaviconResult>> {
    return api.post('/nav/favicon', { url });
  },

  // 图标上传
  uploadIcon(file: File): Promise<ApiResponse<{ iconUrl: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    return api.upload('/nav/icon/upload', formData);
  },

  // 推荐
  getRecommended(): Promise<ApiResponse<RecommendCategory[]>> {
    return api.get('/nav/recommended');
  },
};
