import { type ApiResponse, api } from './api-client'

/**
 * UserSettings 组件/功能描述
 */
export interface UserSettings {
  searchEngine: string
  backgroundImage: string | null
  backgroundType: string
  searchBoxWidth: number
  searchBoxHeight: number
  searchBoxMarginTop: number
  iconSize: number
  iconRadius: number
  iconSpacingX: number
  iconSpacingY: number
  iconTextGap: number
  textSize: number
  iconsMarginTop: number
  iconsMarginX: number
  theme: string
}

/**
 * WallpaperUploadResult 组件/功能描述
 */
export interface WallpaperUploadResult {
  wallpaperUrl: string
}

export const settingsService = {
  /** 获取当前用户的全量个性化设置（搜索框/图标/主题/壁纸等） */
  getSettings(): Promise<ApiResponse<UserSettings>> {
    return api.get('/settings')
  },

  /** 全量保存用户个性化设置，覆盖服务端现有配置 */
  saveSettings(settings: UserSettings): Promise<ApiResponse<null>> {
    return api.put('/settings', settings)
  },

  /** 局部更新用户设置，仅修改传入的字段，其余保持不变 */
  patchSettings(partial: Partial<UserSettings>): Promise<ApiResponse<null>> {
    return api.patch('/settings', partial)
  },

  /** 切换搜索引擎 */
  switchSearchEngine(engine: string): Promise<ApiResponse<null>> {
    return api.patch(`/settings/search-engine?engine=${engine}`)
  },

  /** 上传本地壁纸图片到服务器，返回可公开访问的壁纸 URL */
  uploadWallpaper(file: File): Promise<ApiResponse<WallpaperUploadResult>> {
    const formData = new FormData()
    formData.append('file', file)
    return api.upload('/settings/wallpaper/upload', formData)
  },

  /** 从 Unsplash 随机获取一张高清壁纸 URL */
  getRandomWallpaper(): Promise<ApiResponse<WallpaperUploadResult>> {
    return api.get('/settings/wallpaper/random')
  },
}
