import { api, ApiResponse } from './api-client';
import { UserSettings } from './settings-service';
import { WidgetItemDTO } from './widget-service';
import { NavCategory, NavShortcut } from './nav-service';

export interface GuestConfig {
  settings: UserSettings;
  widgets: WidgetItemDTO[];
  categories: NavCategory[];
  shortcuts: NavShortcut[];
}

export const publicService = {
  getGuestConfig(): Promise<ApiResponse<GuestConfig>> {
    return api.get('/public/guest-config');
  },
};
