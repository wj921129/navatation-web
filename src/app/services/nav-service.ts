import { api, ApiResponse } from './api-client';

// ---- 分类 ----
export interface NavCategory {
  categoryId: string;
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
  shortcutId: string;
  categoryId: string;
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
  categoryId: string;
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
  shortcutId: string;
  sortOrder: number;
}

// ---- 推荐分类 ----
export interface RecommendSite {
  siteId: string;
  categoryId: string;
  name: string;
  url: string;
  iconType: IconType;
  iconValue: string;
  iconColor: string;
}

export interface RecommendCategory {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  sortOrder: number;
  sites: RecommendSite[];
}

export interface RecommendCategoryRequest {
  name: string;
  icon: string;
  sortOrder: number;
}

export interface RecommendSiteRequest {
  categoryId: string;
  name: string;
  url: string;
  iconType: IconType;
  iconValue: string;
  iconColor: string;
  sortOrder: number;
}

// ---- Favicon ----
export interface FaviconResult {
  faviconUrl: string;
  sourceUrl: string;
}

export const navService = {
  // 分类
  /** 获取当前用户的所有导航分类列表 */
  getCategories(): Promise<ApiResponse<NavCategory[]>> {
    return api.get('/nav/categories');
  },
  /** 创建新导航分类 */
  createCategory(data: CreateCategoryRequest): Promise<ApiResponse<NavCategory>> {
    return api.post('/nav/categories', data);
  },
  /** 更新指定分类的名称或排序 */
  updateCategory(categoryId: string, data: Partial<CreateCategoryRequest>): Promise<ApiResponse<null>> {
    return api.put(`/nav/categories/${categoryId}`, data);
  },
  /** 删除指定导航分类 */
  deleteCategory(categoryId: string): Promise<ApiResponse<null>> {
    return api.delete(`/nav/categories/${categoryId}`);
  },

  // 快捷方式
  /** 获取快捷方式列表，可按分类 ID 筛选 */
  getShortcuts(categoryId?: string): Promise<ApiResponse<NavShortcut[]>> {
    const query = categoryId ? `?categoryId=${categoryId}` : '';
    return api.get(`/nav/shortcuts${query}`);
  },
  /** 批量创建快捷方式并归属到指定分类 */
  batchCreateShortcuts(data: BatchCreateRequest): Promise<ApiResponse<{ shortcutId: string; name: string }[]>> {
    return api.post('/nav/shortcuts/batch', data);
  },
  /** 更新指定快捷方式的名称、URL、图标等信息 */
  updateShortcut(shortcutId: string, data: UpdateShortcutRequest): Promise<ApiResponse<NavShortcut>> {
    return api.put(`/nav/shortcuts/${shortcutId}`, data);
  },
  /** 删除指定快捷方式 */
  deleteShortcut(shortcutId: string): Promise<ApiResponse<null>> {
    return api.delete(`/nav/shortcuts/${shortcutId}`);
  },
  /** 批量更新快捷方式排序，传入 shortcutId 与目标 sortOrder 列表 */
  sortShortcuts(items: SortItem[]): Promise<ApiResponse<null>> {
    return api.put('/nav/shortcuts/sort', { items });
  },

  // Favicon
  /** 请求后端嗅探并返回指定 URL 的网站 Favicon 地址 */
  fetchFavicon(url: string): Promise<ApiResponse<FaviconResult>> {
    return api.post('/nav/favicon', { url });
  },

  // 图标上传
  /** 上传自定义图标文件，返回可公开访问的图标 URL */
  uploadIcon(file: File): Promise<ApiResponse<{ iconUrl: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    return api.upload('/nav/icon/upload', formData);
  },

  // 推荐
  /** 获取系统预置的推荐网站分类及站点列表 */
  getRecommended(): Promise<ApiResponse<RecommendCategory[]>> {
    return api.get('/nav/recommended');
  },
  addRecommendCategory(data: RecommendCategoryRequest): Promise<ApiResponse<RecommendCategory>> {
    return api.post('/nav/recommended/categories', data);
  },
  updateRecommendCategory(categoryId: string, data: Partial<RecommendCategoryRequest>): Promise<ApiResponse<null>> {
    return api.put(`/nav/recommended/categories/${categoryId}`, data);
  },
  deleteRecommendCategory(categoryId: string): Promise<ApiResponse<null>> {
    return api.delete(`/nav/recommended/categories/${categoryId}`);
  },
  addRecommendSite(data: RecommendSiteRequest): Promise<ApiResponse<RecommendSite>> {
    return api.post('/nav/recommended/sites', data);
  },
  updateRecommendSite(siteId: string, data: Partial<RecommendSiteRequest>): Promise<ApiResponse<null>> {
    return api.put(`/nav/recommended/sites/${siteId}`, data);
  },
  deleteRecommendSite(siteId: string): Promise<ApiResponse<null>> {
    return api.delete(`/nav/recommended/sites/${siteId}`);
  },
};
