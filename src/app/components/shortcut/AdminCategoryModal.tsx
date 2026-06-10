import React, { useState } from 'react';
import { BaseModal } from '../ui/BaseModal';
import { toast } from 'sonner';
import { navService } from '../../services/nav-service';
import { Check, X, Loader2 } from 'lucide-react';
import { IconMap } from '../ui/IconMap';

/**
 * 分类编辑弹窗组件，用于新增或修改推荐分类
 * 创建日期: 2026-06-09
 */
interface AdminCategoryModalProps {
  editingCategory: any;
  setEditingCategory: (cat: any) => void;
  loadRecommended: () => void;
}

export function AdminCategoryModal({
  editingCategory,
  setEditingCategory,
  loadRecommended,
}: AdminCategoryModalProps) {
  const isOpen = !!editingCategory;
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    if (!editingCategory || isSaving) return;
    setIsSaving(true);
    const req = { 
      name: editingCategory.category, 
      icon: editingCategory.iconValue, 
      sortOrder: editingCategory.sortOrder 
    };
    const p = editingCategory.categoryId 
      ? navService.updateRecommendCategory(editingCategory.categoryId, req)
      : navService.addRecommendCategory(req);
      
    p.then(() => { 
      loadRecommended(); 
      setEditingCategory(null); 
    }).catch((err: any) => {
      console.error('保存分类失败', err);
      toast.warning('保存分类失败，请重试');
    }).finally(() => {
      setIsSaving(false);
    });
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={() => setEditingCategory(null)}
      animationType="scale"
      position="center"
      containerClassName="bg-card p-6 rounded-2xl w-96 shadow-xl"
      overlayClassName="bg-black/50 backdrop-blur-sm"
      zIndex={70}
    >
      <h3 className="text-lg font-medium mb-4">{editingCategory?.categoryId ? '编辑分类' : '新增分类'}</h3>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-500 mb-1 block">分类名称</label>
          <input 
            type="text" 
            className="w-full px-3 py-2 border rounded-lg bg-background outline-none focus:border-blue-500" 
            value={editingCategory?.category || ''} 
            onChange={e => editingCategory && setEditingCategory({...editingCategory, category: e.target.value})} 
          />
        </div>
        <div>
          <label className="text-sm text-gray-500 mb-2 block flex items-center justify-between">
            <span>图标选择</span>
            <span className="text-xs bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-gray-400">{editingCategory?.iconValue || 'Folder'}</span>
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 max-h-64 overflow-y-auto p-3 border rounded-xl bg-background scrollbar-thin">
            {Object.entries(IconMap).map(([iconName, IconComp]) => (
              <button
                key={iconName}
                onClick={() => editingCategory && setEditingCategory({...editingCategory, iconValue: iconName})}
                className={`flex items-center justify-center p-3 rounded-xl transition-all cursor-pointer ${
                  (editingCategory?.iconValue || 'Folder') === iconName
                    ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50 shadow-sm ring-2 ring-blue-500/50'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-neutral-800 dark:hover:text-gray-200 border border-transparent'
                }`}
                title={iconName}
              >
                <IconComp className="w-8 h-8" />
              </button>
            ))}
          </div>
        </div>

      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button onClick={() => setEditingCategory(null)} className="w-10 h-10 flex items-center justify-center border rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer" title="取消">
          <X className="w-4 h-4" />
        </button>
        <button onClick={handleSave} disabled={isSaving} className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer" title="保存">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        </button>
      </div>
    </BaseModal>
  );
}
