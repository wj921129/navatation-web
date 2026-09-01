import { StackShortcut } from '../../constants/recommendedSitesData';
import { resolveAssetUrl } from '../../services/api-client';

export function ShortcutStackItem({ 
  shortcut, 
  iconSize, 
  borderRadius,
  onClick
}: { 
  shortcut: StackShortcut, 
  iconSize: number, 
  borderRadius: string,
  onClick: () => void
}) {
  const innerIcons = shortcut.children.slice(0, 4);
  const gap = 4;
  const padding = 6;
  const itemSize = (iconSize - padding * 2 - gap) / 2;

  return (
    <div 
      onClick={onClick}
      className="bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/10 dark:border-white/5 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer overflow-hidden relative"
      style={{
        width: `${iconSize}px`,
        height: `${iconSize}px`,
        borderRadius,
        padding: `${padding}px`
      }}
    >
      <div className="w-full h-full flex flex-wrap content-start" style={{ gap: `${gap}px` }}>
        {innerIcons.map((child, idx) => (
           <div key={child.dragId || idx} style={{ width: `${itemSize}px`, height: `${itemSize}px`, borderRadius: '4px', overflow: 'hidden', backgroundColor: child.color || '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             {child.iconType === 'CUSTOM_URL' || child.iconType === 'FAVICON' || child.iconType === 'CUSTOM_UPLOAD' ? (
                <img src={resolveAssetUrl(child.iconValue!)} alt="" style={{ width: '60%', height: '60%', objectFit: 'contain' }} />
             ) : (
                <span className="text-xs text-white">...</span>
             )}
           </div>
        ))}
      </div>
    </div>
  );
}
