import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { X as XIcon } from 'lucide-react';
import { IconMap } from '../ui/IconMap';

const SHORTCUT_DRAG_TYPE = 'SHORTCUT';

interface DraggableShortcutProps {
  shortcut: any;
  index: number;
  moveShortcut: (from: number, to: number) => void;
  iconInnerSize: number;
  iconSize: number;
  iconRadius: number;
  iconTextGap: number;
  textSize: number;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * 可拖拽的捷径卡片组件，仅在编辑模式下使用。
 * 通过 react-dnd 的 useDrag / useDrop 实现拖拽重新排序。
 */
export function DraggableShortcut({
  shortcut,
  index,
  moveShortcut,
  iconInnerSize,
  iconSize,
  iconRadius,
  iconTextGap,
  textSize,
  onEdit,
  onDelete,
}: DraggableShortcutProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: SHORTCUT_DRAG_TYPE,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: SHORTCUT_DRAG_TYPE,
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveShortcut(item.index, index);
        item.index = index;
      }
    },
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className="flex flex-col items-center group relative cursor-grab active:cursor-grabbing"
      style={{
        width: `${iconSize + 32}px`,
        opacity: isDragging ? 0.4 : 1,
      }}
    >
      {/* 删除按钮 */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete();
        }}
        className="absolute -top-2 -right-2 z-10 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-all"
      >
        <XIcon className="w-3 h-3 text-white" strokeWidth={3} />
      </button>

      <div
        onClick={onEdit}
        className="flex flex-col items-center w-full"
        style={{ gap: `${iconTextGap}px` }}
      >
        <div
          className="bg-icon-bg border border-widget-border flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden shrink-0"
          style={{
            width: `${iconSize}px`,
            height: `${iconSize}px`,
            borderRadius: `${iconRadius}%`,
          }}
        >
          {(() => {
            if (shortcut.iconType === 'CUSTOM_URL' || shortcut.iconType === 'FAVICON' || shortcut.iconType === 'CUSTOM_UPLOAD') {
              return (
                <img
                  src={shortcut.iconValue}
                  alt={shortcut.name}
                  style={{ width: '50%', height: '50%', objectFit: 'contain' }}
                />
              );
            }
            let IconComp = IconMap.Link;
            const iconName = shortcut.iconValue;
            if (iconName && IconMap[iconName]) {
              IconComp = IconMap[iconName];
            }
            return (
              <IconComp
                style={{ color: shortcut.color || '#333', width: `${iconInnerSize}px`, height: `${iconInnerSize}px` }}
                strokeWidth={2}
              />
            );
          })()}
        </div>
        <span
          className="text-white font-light tracking-wide drop-shadow-lg text-center w-full truncate px-1"
          style={{ fontSize: `${textSize}px` }}
        >
          {shortcut.name}
        </span>
      </div>
    </div>
  );
}
