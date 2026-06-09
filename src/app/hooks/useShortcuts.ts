/**
 * @description 快捷方式管理 Hook
 * @date 2026-06-09
 */
  /**
   * 取消编辑模式。
   * 还原临时编辑列表，清空正在编辑的单项，并退出编辑模式。
   */
  const handleCancelEdits = useCallback(() => {
    setTempShortcuts([...shortcuts]);
    setIsEditMode(false);
    setEditingShortcut(null);
  }, [shortcuts]);

  /**
   * 删除捷径。
   * 过滤临时列表中的对应项。
   */
  const handleDeleteShortcut = useCallback((index: number) => {
    setTempShortcuts(prev => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * 点击单项捷径以启动编辑。
   * 记录正在编辑的捷径下标和具体内容。
   */
  const handleEditShortcut = useCallback((index: number) => {
    setEditingShortcut({ index, shortcut: tempShortcuts[index] });
  }, [tempShortcuts]);

  /**
   * 保存单个捷径的编辑修改。
   * 更新临时列表中的指定项信息。
   */
  const handleSaveEdit = useCallback((updatedShortcut: { name: string; url: string; iconType: string; iconValue: string }) => {
    if (editingShortcut) {
      setTempShortcuts(prev => {
        const newShortcuts = [...prev];
        newShortcuts[editingShortcut.index] = {
          ...newShortcuts[editingShortcut.index],
          name: updatedShortcut.name,
          url: updatedShortcut.url,
          iconType: updatedShortcut.iconType,
          iconValue: updatedShortcut.iconValue,
        };
        return newShortcuts;
      });
      setEditingShortcut(null);
    }
  }, [editingShortcut]);

  // 当外部的登录态改变时，重新拉取（或重置游客）数据
  useEffect(() => {
    fetchShortcuts();
  }, [fetchShortcuts]);

  return {
    shortcuts,
    setShortcuts,
    tempShortcuts,
    setTempShortcuts,
    isEditMode,
    setIsEditMode,
    editingShortcut,
    setEditingShortcut,
    isAddShortcutOpen,
    setIsAddShortcutOpen,
    isLoginOpen,
    setIsLoginOpen,
    isLogoutConfirmOpen,
    setIsLogoutConfirmOpen,
    fetchShortcuts,
    moveShortcut,
    handleAddShortcuts,
    handleStartEdit,
    handleSaveEdits,
    handleCancelEdits,
    handleDeleteShortcut,
    handleEditShortcut,
    handleSaveEdit,
  };
}
