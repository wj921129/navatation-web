import { type ApiResponse, api } from './api-client'

/**
 * WidgetItemDTO 组件/功能描述
 */
export interface WidgetItemDTO {
  widgetId?: string
  type: string
  style: string
  x: number
  y: number
  meta?: Record<string, any>
}

/**
 * 用户自定义组件服务类 (widgetService)
 * 提供组件的云端获取与批量覆盖保存接口
 */
export const widgetService = {
  /**
   * 获取当前登录用户的所有云端组件配置
   * @returns 包含组件 DTO 列表的 API 响应 Promise
   */
  async getWidgets(): Promise<ApiResponse<WidgetItemDTO[]>> {
    try {
      // 发起获取云端组件的 GET 请求
      return await api.get<WidgetItemDTO[]>('/widgets')
    } catch (error) {
      // 记录获取组件失败的日志
      console.error('[widgetService] 获取云端组件失败:', error)
      throw error
    }
  },

  /**
   * 批量覆盖保存当前登录用户的所有组件配置
   * @param widgets 待保存的组件 DTO 列表
   * @returns 空响应的 API 响应 Promise
   */
  async saveWidgets(widgets: WidgetItemDTO[]): Promise<ApiResponse<null>> {
    try {
      // 发起批量覆盖保存组件的 PUT 请求
      return await api.put<null>('/widgets', widgets)
    } catch (error) {
      // 记录保存组件失败的日志
      console.error('[widgetService] 保存云端组件失败:', error)
      throw error
    }
  },
}
