import { Check } from 'lucide-react';
import { useState } from 'react';

interface SearchEngine {
  name: string;
  value: string;
  url: string;
  icon: string;
}

const searchEngines: SearchEngine[] = [
  { name: '谷歌', value: 'google', url: 'https://www.google.com/search?q=', icon: '🔍' },
  { name: '百度', value: 'baidu', url: 'https://www.baidu.com/s?wd=', icon: '百' },
  { name: '必应', value: 'bing', url: 'https://www.bing.com/search?q=', icon: 'B' },
];

interface SearchEngineSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchEngineSelect({ value, onChange }: SearchEngineSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentEngine = searchEngines.find(e => e.value === value) || searchEngines[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
      >
        <span className="text-white text-lg">{currentEngine.icon}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 left-0 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden z-20 min-w-[140px]">
            {searchEngines.map((engine) => (
              <button
                key={engine.value}
                type="button"
                onClick={() => {
                  onChange(engine.value);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-black/5 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{engine.icon}</span>
                  <span className="text-gray-800 text-sm">{engine.name}</span>
                </div>
                {engine.value === value && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export { searchEngines };
