import { Globe, Layers, X } from 'lucide-react'

export function IconEntryModal({
  isOpen,
  onClose,
  onSelectSingle,
  onSelectStack,
}: {
  isOpen: boolean
  onClose: () => void
  onSelectSingle: () => void
  onSelectStack: () => void
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl p-6 shadow-2xl w-full max-w-sm border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">添加图标</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={onSelectSingle}
            className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all border border-transparent hover:border-blue-500/30"
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Globe className="text-blue-500" />
            </div>
            <span className="font-medium text-gray-700 dark:text-gray-200">单一网址</span>
          </button>
          <button
            onClick={onSelectStack}
            className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all border border-transparent hover:border-purple-500/30"
          >
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Layers className="text-purple-500" />
            </div>
            <span className="font-medium text-gray-700 dark:text-gray-200">图标堆叠</span>
          </button>
        </div>
      </div>
    </div>
  )
}
