import React from 'react';
import { BaseModal } from '../ui/BaseModal';
import { toast } from 'sonner';
import { navService } from '../../services/nav-service';

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

  const handleSave = () => {
    if (!editingCategory) return;
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
          <label className="text-sm text-gray-500 mb-1 block">图标 (lucide-react name)</label>
          <input 
            type="text" 
            className="w-full px-3 py-2 border rounded-lg bg-background outline-none focus:border-blue-500" 
            value={editingCategory?.iconValue || ''} 
            onChange={e => editingCategory && setEditingCategory({...editingCategory, iconValue: e.target.value})} 
          />
        </div>

      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button onClick={() => setEditingCategory(null)} className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">取消</button>
        <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">保存</button>
      </div>
    </BaseModal>
  );
}
