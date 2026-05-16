import { X, Upload } from 'lucide-react';
import { useState, useEffect } from 'react';

interface EditShortcutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (shortcut: { name: string; url: string; iconUrl?: string }) => void;
  shortcut: {
    name: string;
    url: string;
  };
}

export function EditShortcutDialog({ isOpen, onClose, onSave, shortcut }: EditShortcutDialogProps) {
  const [name, setName] = useState(shortcut.name);
  const [url, setUrl] = useState(shortcut.url);
  const [iconUrl, setIconUrl] = useState('');
  const [iconFile, setIconFile] = useState<string | null>(null);

  useEffect(() => {
    setName(shortcut.name);
    setUrl(shortcut.url);
  }, [shortcut]);

  if (!isOpen) return null;

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setIconFile(event.target.result as string);
          setIconUrl('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (name.trim() && url.trim()) {
      onSave({
        name,
        url: url.startsWith('http') ? url : `https://${url}`,
        iconUrl: iconFile || iconUrl || undefined,
      });
      onClose();
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <div
          className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl text-gray-800">编辑网址</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/5 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm text-gray-700 mb-2">网址链接 *</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-800 outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">网址名称 *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="网站名称"
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-800 outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">网址图标链接</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={iconUrl}
                  onChange={(e) => {
                    setIconUrl(e.target.value);
                    setIconFile(null);
                  }}
                  placeholder="https://example.com/icon.png"
                  className="flex-1 px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-800 outline-none focus:border-blue-500 focus:bg-white transition-all"
                  disabled={!!iconFile}
                />
                <label className="px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl cursor-pointer flex items-center gap-2 transition-colors">
                  <Upload className="w-4 h-4 text-gray-700" />
                  <span className="text-sm text-gray-700">上传</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleIconUpload}
                    className="hidden"
                  />
                </label>
              </div>
              {iconFile && (
                <div className="mt-3 flex items-center gap-3">
                  <img
                    src={iconFile}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    onClick={() => setIconFile(null)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    移除
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim() || !url.trim()}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
