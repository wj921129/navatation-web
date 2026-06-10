import { Grid, List, Check, RotateCw, FolderCog } from 'lucide-react';
import React, { useTransition } from 'react';

/**
 * 管理员侧边栏操作组件，提供切换模式、保存、新增分类和批量刷新图标功能
 * 创建日期: 2026-06-09
 */
interface AdminDockProps {
  isBatchMode: boolean;
  setIsBatchMode: (val: boolean) => void;
  toggleBatchMode: (val?: boolean) => void;
  handleSaveAllCategories: () => void;
  setEditingCategory: (cat: any) => void;
  categoriesLength: number;
  handleBatchRefreshAllIcons: () => void;
  isAllRefreshing: boolean;
  onSortCategories: () => void;
}

export function AdminDock({
  isBatchMode,
  setIsBatchMode,
  toggleBatchMode,
  handleSaveAllCategories,
  setEditingCategory,
  categoriesLength,
  handleBatchRefreshAllIcons,
  isAllRefreshing,
  onSortCategories,
}: AdminDockProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="absolute top-8 -left-[71px] w-[72px] bg-card/60 backdrop-blur-2xl hover:bg-card/95 border border-border hover:border-border/80 border-r-0 rounded-l-3xl p-3 py-6 flex flex-col items-center gap-4 z-50 transition-all duration-300 animate-in fade-in slide-in-from-right-4 shadow-[-10px_10px_20px_-5px_rgba(0,0,0,0.08)] hover:shadow-[-12px_12px_24px_-5px_rgba(0,0,0,0.15)] dark:shadow-[-10px_10px_20px_-5px_rgba(0,0,0,0.5)] dark:hover:shadow-[-12px_12px_24px_-5px_rgba(0,0,0,0.7)] group cursor-default">
      
      {/* 模式切换 (图标/列表) */}
      <div className="group relative flex items-center justify-center">
        <button
          onClick={() => startTransition(() => toggleBatchMode())}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm border cursor-pointer ${
            !isBatchMode 
              ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400' 
              : 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-400'
          }`}
        >
          {!isBatchMode ? <Grid className="w-5 h-5" /> : <List className="w-5 h-5" />}
        </button>
        <div className="absolute left-full ml-4 px-3 py-2 bg-gray-800/95 backdrop-blur-sm text-white text-sm font-medium rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-all shadow-xl z-50 translate-x-[-10px] group-hover:translate-x-0">
          切换为{!isBatchMode ? '列表管理' : '图标管理'}
          <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 border-y-4 border-y-transparent border-r-4 border-r-gray-800/95" />
        </div>
      </div>

      <div className="w-8 h-[1px] bg-border/60" />

      {/* 保存全部更改 */}
      <div className="group relative flex items-center justify-center">
        <button
          onClick={handleSaveAllCategories}
          className="w-12 h-12 rounded-full flex items-center justify-center bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 hover:scale-105 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/50 transition-all duration-300 shadow-sm cursor-pointer"
        >
          <Check className="w-5 h-5" />
        </button>
        <div className="absolute left-full ml-4 px-3 py-2 bg-gray-800/95 backdrop-blur-sm text-white text-sm font-medium rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-all shadow-xl z-50 translate-x-[-10px] group-hover:translate-x-0">
          保存全部更改
          <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 border-y-4 border-y-transparent border-r-4 border-r-gray-800/95" />
        </div>
      </div>



      {/* 一键刷新全部图标 */}
      {isBatchMode && (
        <div className="group relative flex items-center justify-center">
          <button
            onClick={handleBatchRefreshAllIcons}
            disabled={isAllRefreshing}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-100 hover:scale-105 dark:bg-purple-900/30 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-900/50 transition-all duration-300 shadow-sm disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
          >
            <RotateCw className={`w-5 h-5 ${isAllRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <div className="absolute left-full ml-4 px-3 py-2 bg-gray-800/95 backdrop-blur-sm text-white text-sm font-medium rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-all shadow-xl z-50 translate-x-[-10px] group-hover:translate-x-0">
            {isAllRefreshing ? '正在刷新...' : '一键刷新图标'}
            <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 border-y-4 border-y-transparent border-r-4 border-r-gray-800/95" />
          </div>
        </div>
      )}

      <div className="w-8 h-[1px] bg-border/60" />

      {/* 分类排序 */}
      <div className="group relative flex items-center justify-center">
        <button
          onClick={onSortCategories}
          className="w-12 h-12 rounded-full flex items-center justify-center bg-teal-50 text-teal-600 border border-teal-200 hover:bg-teal-100 hover:scale-105 dark:bg-teal-900/30 dark:border-teal-800 dark:text-teal-400 dark:hover:bg-teal-900/50 transition-all duration-300 shadow-sm cursor-pointer"
        >
          <FolderCog className="w-5 h-5" />
        </button>
        <div className="absolute left-full ml-4 px-3 py-2 bg-gray-800/95 backdrop-blur-sm text-white text-sm font-medium rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-all shadow-xl z-50 translate-x-[-10px] group-hover:translate-x-0">
          分类管理
          <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 border-y-4 border-y-transparent border-r-4 border-r-gray-800/95" />
        </div>
      </div>

    </div>
  );
}
