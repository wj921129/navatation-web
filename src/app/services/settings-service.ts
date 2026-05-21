import { api, ApiResponse } from './api-client';

export interface UserSettings {
  searchEngine: string;
  backgroundImage: string | null;
  backgroundType: string;
  searchBoxWidth: number;
  searchBoxHeight: number;
  searchBoxMarginTop: number;
  iconSize: number;
  iconRadius: number;
  iconSpacingX: number;
  iconSpacingY: number;
  iconTextGap: number;
  textSize: number;
  iconsMarginTop: number;
  theme: string;
}

export interface WallpaperUploadResult {
  wallpaperUrl: string;
}

export const settingsService = {
  getSettings(): Promise<ApiResponse<UserSettings>> {
    return api.get('/settings');
  },

  saveSettings(settings: UserSettings): Promise<ApiResponse<null>> {
    return api.put('/settings', settings);
  },

  patchSettings(partial: Partial<UserSettings>): Promise<ApiResponse<null>> {
    return api.patch('/settings', partial);
  },

  uploadWallpaper(file: File): Promise<ApiResponse<WallpaperUploadResult>> {
    const formData = new FormData();
    formData.append('file', file);
    return api.upload('/settings/wallpaper/upload', formData);
  },

  getRandomWallpaper(): Promise<ApiResponse<WallpaperUploadResult>> {
    return api.get('/settings/wallpaper/random');
  },
};
