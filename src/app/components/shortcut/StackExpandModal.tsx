import { StackShortcut } from '../../constants/recommendedSitesData'
import { createPortal } from 'react-dom'

export function StackExpandModal({
  isOpen,
  onClose,
  stack,
}: {
  isOpen: boolean
  onClose: () => void
  stack: StackShortcut | null
}) {
  if (!isOpen || !stack || typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xl animate-in fade-in duration-300 pointer-events-auto"
      onClick={onClose}
    >
      <div
        className="w-[80vw] h-[80vh] bg-transparent flex flex-col pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white drop-shadow-md">{stack.name}</h2>
        </div>

        {/* Render grid reusing existing ShortcutGrid if possible, or mapping items */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-8 justify-items-center">
            {stack.children.map((child) => (
              <div key={child.dragId} className="flex flex-col items-center gap-3 group">
                <a
                  href={child.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-white/20 group-hover:scale-105 transition-all cursor-pointer shadow-lg border border-white/5"
                >
                  {/* Simplified icon rendering, matching original desktop logic */}
                  <span className="text-2xl font-semibold">{child.name?.charAt(0) || '?'}</span>
                </a>
                <span className="text-white text-sm font-medium drop-shadow-md truncate max-w-[80px] text-center">
                  {child.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
