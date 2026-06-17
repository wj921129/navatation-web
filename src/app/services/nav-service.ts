import { type ApiResponse, api } from './api-client'

// ---- 分类 ----
/**
 * NavCategory 组件/功能描述
 */
export interface NavCategory {
  categoryId: string
  name: string
  sortOrder: number
  shortcutCount: number
}

/**
 * CreateCategoryRequest 组件/功能描述
 */
export interface CreateCategoryRequest {
  name: string
  sortOrder: number
}

// ---- 快捷方式 ----
/**
 * IconType 组件/功能描述
 */
export type IconType = 'BUILTIN' | 'FAVICON' | 'CUSTOM_URL' | 'CUSTOM_UPLOAD'

/**
 * NavShortcut 组件/功能描述
 */
export interface NavShortcut {
  shortcutId: string
  categoryId: string
  name: string
  url: string
  iconType: IconType
  iconValue: string | null
  iconColor: string | null
  sortOrder: number
  createdAt: string
}

/**
 * CreateShortcutItem 组件/功能描述
 */
export interface CreateShortcutItem {
  name: string
  url: string
  iconType: IconType
  iconValue?: string
  iconColor?: string
}

/**
 * BatchCreateRequest 组件/功能描述
 */
export interface BatchCreateRequest {
  categoryId: string
  shortcuts: CreateShortcutItem[]
}

/**
 * UpdateShortcutRequest 组件/功能描述
 */
export interface UpdateShortcutRequest {
  name: string
  url: string
  iconType?: IconType
  iconValue?: string
  iconColor?: string
}

/**
 * SortItem 组件/功能描述
 */
export interface SortItem {
  shortcutId: string
  sortOrder: number
}

// ---- 推荐分类 ----
/**
 * RecommendSite 组件/功能描述
 */
export interface RecommendSite {
  siteId: string
  categoryId: string
  name: string
  url: string
  iconType: IconType
  iconValue: string
  iconColor: string
  sortOrder: number
}

/**
 * RecommendCategory 组件/功能描述
 */
export interface RecommendCategory {
  categoryId: string
  categoryName: string
  categoryIcon: string
  sortOrder: number
  sites: RecommendSite[]
}

/**
 * RecommendCategoryRequest 组件/功能描述
 */
export interface RecommendCategoryRequest {
  name: string
  icon: string
  sortOrder: number
}

/**
 * RecommendSiteRequest 组件/功能描述
 */
export interface RecommendSiteRequest {
  categoryId: string
  name: string
  url: string
  iconType: IconType
  iconValue: string
  iconColor: string
  sortOrder: number
}

// ---- 首页图标 ----
/**
 * HomeShortcut 首页图标项（admin/游客首页已添加的网页图标）
 */
export interface HomeShortcut {
  shortcutId: string
  name: string
  url: string
  iconType: IconType
  iconValue: string | null
  iconColor: string | null
  sortOrder: number
}

/**
 * HomeShortcutRequest 首页图标创建/更新请求
 */
export interface HomeShortcutRequest {
  name: string
  url: string
  iconType?: IconType
  iconValue?: string
  iconColor?: string
  sortOrder?: number
}

// ---- Favicon ----
/**
 * FaviconResult 组件/功能描述
 */
export interface FaviconResult {
  faviconUrls: string[]
  sourceUrl: string
}

export const navService = {
  // 分类
  /** 获取当前用户的所有导航分类列表 */
  getCategories(): Promise<ApiResponse<NavCategory[]>> {
    const token = localStorage.getItem('access_token')
    if (!token) {
      const guestCategories = localStorage.getItem('navatation_guest_categories')
      if (guestCategories) {
        try {
          return Promise.resolve({
            code: 200,
            message: 'success',
            data: JSON.parse(guestCategories),
          })
        } catch (e) {
          // ignore
        }
      }
      return Promise.resolve({ code: 200, message: 'success', data: [] })
    }
    return api.get('/nav/categories')
  },
  /** 创建新导航分类 */
  createCategory(data: CreateCategoryRequest): Promise<ApiResponse<NavCategory>> {
    return api.post('/nav/categories', data)
  },
  /** 更新指定分类的名称或排序 */
  updateCategory(
    categoryId: string,
    data: Partial<CreateCategoryRequest>,
  ): Promise<ApiResponse<null>> {
    return api.put(`/nav/categories/${categoryId}`, data)
  },
  /** 删除指定导航分类 */
  deleteCategory(categoryId: string): Promise<ApiResponse<null>> {
    return api.delete(`/nav/categories/${categoryId}`)
  },

  // 快捷方式
  /** 获取快捷方式列表，可按分类 ID 筛选 */
  getShortcuts(categoryId?: string): Promise<ApiResponse<NavShortcut[]>> {
    const query = categoryId ? `?categoryId=${categoryId}` : ''
    return api.get(`/nav/shortcuts${query}`)
  },
  /** 批量创建快捷方式并归属到指定分类 */
  batchCreateShortcuts(
    data: BatchCreateRequest,
  ): Promise<ApiResponse<{ shortcutId: string; name: string }[]>> {
    return api.post('/nav/shortcuts/batch', data)
  },
  /** 更新指定快捷方式的名称、URL、图标等信息 */
  updateShortcut(
    shortcutId: string,
    data: UpdateShortcutRequest,
  ): Promise<ApiResponse<NavShortcut>> {
    return api.put(`/nav/shortcuts/${shortcutId}`, data)
  },
  /** 删除指定快捷方式 */
  deleteShortcut(shortcutId: string): Promise<ApiResponse<null>> {
    return api.delete(`/nav/shortcuts/${shortcutId}`)
  },
  /** 批量更新快捷方式排序，传入 shortcutId 与目标 sortOrder 列表 */
  sortShortcuts(items: SortItem[]): Promise<ApiResponse<null>> {
    return api.put('/nav/shortcuts/sort', { items })
  },

  // Favicon
  /** 请求后端嗅探并返回指定 URL 的网站 Favicon 地址 */
  fetchFavicon(url: string): Promise<ApiResponse<FaviconResult>> {
    return api.post('/nav/favicon', { url })
  },
  /** 批量请求后端嗅探并返回指定 URL 列表的网站 Favicon 地址映射 */
  fetchFaviconsInBatch(urls: string[]): Promise<ApiResponse<Record<string, FaviconResult>>> {
    return api.post('/nav/favicon/batch', { urls })
  },

  // 图标上传
  /** 上传自定义图标文件，返回可公开访问的图标 URL */
  uploadIcon(file: File): Promise<ApiResponse<{ iconUrl: string }>> {
    const formData = new FormData()
    formData.append('file', file)
    return api.upload('/nav/icon/upload', formData)
  },

  // 首页图标
  /** 获取首页图标列表 */
  getHomeShortcuts(): Promise<ApiResponse<HomeShortcut[]>> {
    return api.get('/nav/home-shortcuts')
  },
  /** 添加首页图标 */
  addHomeShortcut(data: HomeShortcutRequest): Promise<ApiResponse<HomeShortcut>> {
    return api.post('/nav/home-shortcuts', data)
  },
  /** 更新首页图标 */
  updateHomeShortcut(
    shortcutId: string,
    data: Partial<HomeShortcutRequest>,
  ): Promise<ApiResponse<HomeShortcut>> {
    return api.put(`/nav/home-shortcuts/${shortcutId}`, data)
  },
  /** 删除首页图标 */
  deleteHomeShortcut(shortcutId: string): Promise<ApiResponse<null>> {
    return api.delete(`/nav/home-shortcuts/${shortcutId}`)
  },

  // 推荐
  /** 获取系统预置的推荐网站分类及站点列表 */
  getRecommended(): Promise<ApiResponse<RecommendCategory[]>> {
    return api.get('/nav/recommended')
  },
  addRecommendCategory(data: RecommendCategoryRequest): Promise<ApiResponse<RecommendCategory>> {
    return api.post('/nav/recommended/categories', data)
  },
  updateRecommendCategory(
    categoryId: string,
    data: Partial<RecommendCategoryRequest>,
  ): Promise<ApiResponse<null>> {
    return api.put(`/nav/recommended/categories/${categoryId}`, data)
  },
  deleteRecommendCategory(categoryId: string): Promise<ApiResponse<null>> {
    return api.delete(`/nav/recommended/categories/${categoryId}`)
  },
  addRecommendSite(data: RecommendSiteRequest): Promise<ApiResponse<RecommendSite>> {
    return api.post('/nav/recommended/sites', data)
  },
  updateRecommendSite(
    siteId: string,
    data: Partial<RecommendSiteRequest>,
  ): Promise<ApiResponse<null>> {
    return api.put(`/nav/recommended/sites/${siteId}`, data)
  },
  deleteRecommendSite(siteId: string): Promise<ApiResponse<null>> {
    return api.delete(`/nav/recommended/sites/${siteId}`)
  },
  batchSaveRecommendSites(categoryId: string, data: { sites: any[] }): Promise<ApiResponse<null>> {
    return api.post(`/nav/recommended/categories/${categoryId}/sites/batch`, data)
  },
}
