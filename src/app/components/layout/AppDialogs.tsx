/**
 * @description 前端UI组件：AppDialogs.tsx
 * @date 2026-06-10
 */
import React from 'react'
import { LoginDialog } from '../auth/LoginDialog'
import { LogoutConfirmDialog } from '../auth/LogoutConfirmDialog'
import { AiSearchOverlay } from '../search/AiSearchOverlay'
import { SettingsDialog } from '../settings/SettingsDialog'
import { AddShortcutDialog } from '../shortcut/AddShortcutDialog'
import { EditShortcutDialog } from '../shortcut/EditShortcutDialog'
import { ManageHomepageShortcutsDialog } from '../shortcut/ManageHomepageShortcutsDialog'
import { TodoPanel } from '../todo/TodoPanel'

/**
 * AppDialogsProps 组件/功能描述
 */
export interface AppDialogsProps {
  isSettingsOpen: boolean
  handleCloseSettings: () => void
  handleSaveSettings: (draftSettings: any, draftBackgroundImage: string, draftTheme: string) => void
  handlePreviewSettings: (previewSettings: any, previewBg: string, previewTheme: string) => void
  settings: any
  backgroundImage: string
  theme: string

  isLoginOpen: boolean
  setIsLoginOpen: (v: boolean) => void

  isTodoOpen: boolean
  setIsTodoOpen: (v: boolean) => void

  isLogoutConfirmOpen: boolean
  setIsLogoutConfirmOpen: (v: boolean) => void
  handleLogout: () => void
  authState: any

  isAddShortcutOpen: boolean
  setIsAddShortcutOpen: (v: boolean) => void
  handleAddShortcuts: (site: any) => void

  editingShortcut: any
  setEditingShortcut: (v: any) => void
  handleSaveEdit: (shortcut: {
    name: string
    url: string
    iconType: string
    iconValue: string
  }) => void

  isManageHomepageOpen: boolean
  setIsManageHomepageOpen: (v: boolean) => void
  shortcuts: any[]
  fetchShortcuts: () => void

  isAiSearchOpen: boolean
  setIsAiSearchOpen: (v: boolean) => void
  aiSearchQuery: string
  aiSearchEngine: string
}

/**
 * AppDialogs 组件/功能描述
 */
export function AppDialogs({
  isSettingsOpen,
  handleCloseSettings,
  handleSaveSettings,
  handlePreviewSettings,
  settings,
  backgroundImage,
  theme,
  isLoginOpen,
  setIsLoginOpen,
  isTodoOpen,
  setIsTodoOpen,
  isLogoutConfirmOpen,
  setIsLogoutConfirmOpen,
  handleLogout,
  authState,
  isAddShortcutOpen,
  setIsAddShortcutOpen,
  handleAddShortcuts,
  editingShortcut,
  setEditingShortcut,
  handleSaveEdit,
  isManageHomepageOpen,
  setIsManageHomepageOpen,
  shortcuts,
  fetchShortcuts,
  isAiSearchOpen,
  setIsAiSearchOpen,
  aiSearchQuery,
  aiSearchEngine,
}: AppDialogsProps) {
  return (
    <>
      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
        onSave={handleSaveSettings}
        onPreview={handlePreviewSettings}
        settings={settings}
        backgroundImage={backgroundImage}
        currentTheme={theme || 'light'}
      />
      <LoginDialog isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <TodoPanel isOpen={isTodoOpen} onClose={() => setIsTodoOpen(false)} />
      <LogoutConfirmDialog
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleLogout}
        username={authState.user?.username}
      />
      <AddShortcutDialog
        isOpen={isAddShortcutOpen}
        onClose={() => setIsAddShortcutOpen(false)}
        onAdd={handleAddShortcuts}
        iconSize={settings.iconSize}
        iconRadius={settings.iconRadius}
        iconSpacingX={settings.iconSpacingX}
        iconSpacingY={settings.iconSpacingY}
        iconTextGap={settings.iconTextGap}
        textSize={settings.textSize}
        userRole={authState.user?.role}
      />
      <EditShortcutDialog
        isOpen={!!editingShortcut}
        onClose={() => setEditingShortcut(null)}
        onSave={handleSaveEdit}
        shortcut={editingShortcut ? editingShortcut.shortcut : { name: '', url: '' }}
      />
      <ManageHomepageShortcutsDialog
        isOpen={isManageHomepageOpen}
        onClose={() => setIsManageHomepageOpen(false)}
        shortcuts={shortcuts}
        iconSize={settings.iconSize}
        iconRadius={settings.iconRadius}
        iconSpacingX={settings.iconSpacingX}
        iconSpacingY={settings.iconSpacingY}
        iconTextGap={settings.iconTextGap}
        textSize={settings.textSize}
        onSaveComplete={() => fetchShortcuts()}
      />
      <AiSearchOverlay
        isOpen={isAiSearchOpen}
        onClose={() => setIsAiSearchOpen(false)}
        initialQuery={aiSearchQuery}
        initialEngine={aiSearchEngine}
      />
    </>
  )
}
