import { api, ApiResponse } from './api-client';
import { Settings } from './settings-service';
import { Widget } from './widget-service';
import { NavCategory, NavShortcut } from './nav-service';

export interface GuestConfig {
  settings: Settings;
  widgets: Widget[];
  categories: NavCategory[];
  shortcuts: NavShortcut[];
}

export const publicService = {
  getGuestConfig(): Promise<ApiResponse<GuestConfig>> {
    return api.get('/public/guest-config');
  },
};
