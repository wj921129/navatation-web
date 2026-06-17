/**
 * 文件名：BottomRightDock.tsx
 * 描述：应用右下角操作栏（编辑、设置、账号等按钮）
 * 创建时间：2026-06-09
 */
import { Edit3, LayoutGrid, Plus, Save, Settings, User } from 'lucide-react'
import { Tooltip } from '../ui/Tooltip'

interface BottomRightDockProps {
  isEditMode: boolean
  authState: any
  handleCancelEdits: () => void
  handleSaveEdits: () => void
  handleStartEdit: () => void
  handleOpenSettings: () => void
  setIsLogoutConfirmOpen: (val: boolean) => void
  setIsLoginOpen: (val: boolean) => void
  setIsManageHomepageOpen: (val: boolean) => void
}

export function BottomRightDock({
  isEditMode,
  authState,
  handleCancelEdits,
  handleSaveEdits,
  handleStartEdit,
  handleOpenSettings,
  setIsLogoutConfirmOpen,
  setIsLoginOpen,
  setIsManageHomepageOpen,
}: BottomRightDockProps) {
  return (
    <div className="fixed bottom-8 right-8 flex items-center gap-4 z-30">
      {/* Edit Mode Buttons */}
      {isEditMode ? (
        <>
          {/* Cancel Button */}
          <Tooltip content="取消编辑" side="top">
            <button
              onClick={handleCancelEdits}
              className="w-12 h-12 rounded-full glass-button flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5 text-white rotate-45" />
            </button>
          </Tooltip>

          {/* Save Button */}
          <Tooltip content="保存布局" side="top">
            <button
              onClick={handleSaveEdits}
              className="w-12 h-12 rounded-full bg-green-500/80 backdrop-blur-xl border border-green-400/50 flex items-center justify-center hover:bg-green-600 hover:scale-110 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Save className="w-5 h-5 text-white" />
            </button>
          </Tooltip>
        </>
      ) : (
        <>
          {/* Manage Homepage Shortcuts Button (Admin only) */}
          {authState.isLoggedIn && authState.user?.role === 'ADMIN' ? (
            <Tooltip content="管理首页图标" side="top">
              <button
                onClick={() => setIsManageHomepageOpen(true)}
                className="w-12 h-12 rounded-full glass-button flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg hover:shadow-xl"
              >
                <LayoutGrid className="w-5 h-5 text-white" />
              </button>
            </Tooltip>
          ) : null}

          {/* Edit Button */}
          {authState.isLoggedIn ? (
            <Tooltip content="编辑布局" side="top">
              <button
                onClick={handleStartEdit}
                className="w-12 h-12 rounded-full glass-button flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg hover:shadow-xl"
              >
                <Edit3 className="w-5 h-5 text-white" />
              </button>
            </Tooltip>
          ) : null}

          {/* Settings Button */}
          <Tooltip content="个性化设置" side="top">
            <button
              onClick={handleOpenSettings}
              className="w-12 h-12 rounded-full glass-button flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg hover:shadow-xl"
            >
              <Settings className="w-5 h-5 text-white" />
            </button>
          </Tooltip>

          {/* Account Button */}
          <Tooltip content={authState.isLoggedIn ? '账号设置' : '登录/注册'} side="top">
            <button
              onClick={() =>
                authState.isLoggedIn ? setIsLogoutConfirmOpen(true) : setIsLoginOpen(true)
              }
              className="w-12 h-12 rounded-full glass-button flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg hover:shadow-xl relative"
            >
              {authState.isLoggedIn && authState.user ? (
                <span className="text-white text-sm font-medium">
                  {authState.user.username.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
              {authState.isLoggedIn ? (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-neutral-900" />
              ) : null}
            </button>
          </Tooltip>
        </>
      )}
    </div>
  )
}
