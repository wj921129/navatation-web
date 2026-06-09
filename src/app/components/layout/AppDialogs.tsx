import React from 'react';
import { SettingsDialog } from '../settings/SettingsDialog';
import { LoginDialog } from '../auth/LoginDialog';
import { TodoPanel } from '../todo/TodoPanel';
import { LogoutConfirmDialog } from '../auth/LogoutConfirmDialog';
import { AddShortcutDialog } from '../shortcut/AddShortcutDialog';
import { EditShortcutDialog } from '../shortcut/EditShortcutDialog';
import { ManageHomepageShortcutsDialog } from '../shortcut/ManageHomepageShortcutsDialog';
import { AiSearchOverlay } from '../search/AiSearchOverlay';

/**
 * AppDialogsProps 组件/功能描述
 */
export interface AppDialogsProps {
  isSettingsOpen: boolean;
  handleCloseSettings: () => void;
  handleSaveSettings: () => void;
  handlePreviewSettings: () => void;
  settings: any;
  backgroundImage: string;
  theme: string;

  isLoginOpen: boolean;
  setIsLoginOpen: (v: boolean) => void;

  isTodoOpen: boolean;
  setIsTodoOpen: (v: boolean) => void;

  isLogoutConfirmOpen: boolean;
  setIsLogoutConfirmOpen: (v: boolean) => void;
  handleLogout: () => void;
  authState: any;

  isAddShortcutOpen: boolean;
  setIsAddShortcutOpen: (v: boolean) => void;
  handleAddShortcuts: (site: any) => void;

  editingShortcut: any;
  setEditingShortcut: (v: any) => void;
  handleSaveEdit: (shortcut: any, iconFile: File | null) => Promise<boolean>;

  isManageHomepageOpen: boolean;
  setIsManageHomepageOpen: (v: boolean) => void;
  shortcuts: any[];
  fetchShortcuts: () => void;

  isAiSearchOpen: boolean;
  setIsAiSearchOpen: (v: boolean) => void;
  aiSearchQuery: string;
  aiSearchEngine: string;
}

/**
 * AppDialogs 组件/功能描述
 */
export function AppDialogs({
  isSettingsOpen, handleCloseSettings, handleSaveSettings, handlePreviewSettings, settings, backgroundImage, theme,
  isLoginOpen, setIsLoginOpen,
  isTodoOpen, setIsTodoOpen,
  isLogoutConfirmOpen, setIsLogoutConfirmOpen, handleLogout, authState,
  isAddShortcutOpen, setIsAddShortcutOpen, handleAddShortcuts,
  editingShortcut, setEditingShortcut, handleSaveEdit,
  isManageHomepageOpen, setIsManageHomepageOpen, shortcuts, fetchShortcuts,
  isAiSearchOpen, setIsAiSearchOpen, aiSearchQuery, aiSearchEngine
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
      <LoginDialog
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
      <TodoPanel
        isOpen={isTodoOpen}
        onClose={() => setIsTodoOpen(false)}
      />
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
      {editingShortcut ? (
        <EditShortcutDialog
          isOpen={!!editingShortcut}
          onClose={() => setEditingShortcut(null)}
          onSave={handleSaveEdit}
          shortcut={editingShortcut.shortcut}
        />
      ) : null}
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
  );
}
